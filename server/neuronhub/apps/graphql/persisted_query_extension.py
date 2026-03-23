import json
import logging
from dataclasses import dataclass
from datetime import datetime
from typing import Any

from django.conf import settings
from graphql import REMOVE
from graphql import DocumentNode
from graphql import FieldNode
from graphql import FragmentDefinitionNode
from graphql import OperationDefinitionNode
from graphql import Visitor
from graphql import parse
from graphql import print_ast
from graphql import visit
from strawberry.extensions import SchemaExtension

from neuronhub.settings import DjangoEnv


logger = logging.getLogger(__name__)


@dataclass
class GraphqlQuery:
    op_name: str
    query: str


class BackendGraphqlWhitelist:
    """
    Eg mutations for cron triggering.
    """

    queries: dict[str, str] = {}

    def register(self, query: GraphqlQuery):
        self.queries[query.op_name] = query.query


graphql_whitelist_BE = BackendGraphqlWhitelist()


class PersistedQueryExtension(SchemaExtension):
    def on_parse(self):
        is_pytest = settings.DJANGO_ENV is DjangoEnv.DEV_TEST_UNIT
        if not is_pytest:
            assert _is_query_allowed(self.execution_context.query)
        yield


def _is_query_allowed(query: str) -> bool:
    query_doc = parse(query)

    op_name = _get_operation_name(query_doc)
    assert op_name, _error_msg(query, "no OP name")

    graphql_whitelist_FE = _load_client_persisted_queries_json()
    graphql_whitelist = {**graphql_whitelist_FE, **graphql_whitelist_BE.queries}
    assert op_name in graphql_whitelist, f"wrong OP name, {_error_msg(query)}"

    query_normalized = _normalize_query(query)
    query_whitelisted_normalized = _normalize_query(graphql_whitelist[op_name])
    assert print_ast(query_normalized) == print_ast(query_whitelisted_normalized), _error_msg(
        query
    )
    return True


def _get_operation_name(doc: DocumentNode) -> str | None:
    for definition in doc.definitions:
        if isinstance(definition, OperationDefinitionNode):
            if definition.name:
                return definition.name.value
    return None


class whitelist_file:
    name = "persisted-queries.json"  # todo ! refac: use a Mise env
    cache_in_RAM: dict[str, str] | None = None
    cache_in_RAM_timestamp: datetime | None = None


def _error_msg(query_name: str, error: str = "") -> str:
    msg_base = f"query not in {whitelist_file.name} or `graphql_whitelist_BE`: `{query_name}`"
    if error:
        return f"{msg_base}: error '{error}'"
    return msg_base


def _load_client_persisted_queries_json() -> dict[str, str]:
    whitelist_path = settings.BASE_DIR / whitelist_file.name
    assert whitelist_path.exists()

    file_timestamp = datetime.fromtimestamp(whitelist_path.stat().st_mtime)
    is_rebuild_needed = (
        whitelist_file.cache_in_RAM is None
        or whitelist_file.cache_in_RAM_timestamp is None
        or file_timestamp > whitelist_file.cache_in_RAM_timestamp
    )
    if is_rebuild_needed:
        with open(whitelist_path) as file:
            whitelist_file.cache_in_RAM = json.load(file)
        whitelist_file.cache_in_RAM_timestamp = file_timestamp

    assert whitelist_file.cache_in_RAM
    return whitelist_file.cache_in_RAM


def _normalize_query(query_string: str) -> DocumentNode:
    """
    #AI, though reviewed, i didn't do a deep dive in "graphql" fragments. Though it's hard to fuck up a string check.
    # todo !! fix(sec): audit & pentest
    """
    doc = parse(query_string)

    class TypenameRemover(Visitor):
        def enter_field(self, node: FieldNode, *args) -> Any:
            if node.name.value == "__typename":
                return REMOVE
            return node

    doc = visit(doc, TypenameRemover())

    # Sort fragment definitions alphabetically for deterministic comparison
    operations = [
        defn for defn in doc.definitions if not isinstance(defn, FragmentDefinitionNode)
    ]
    fragments = [defn for defn in doc.definitions if isinstance(defn, FragmentDefinitionNode)]
    fragments_sorted = sorted(fragments, key=lambda fragment: fragment.name.value)

    return DocumentNode(definitions=operations + fragments_sorted)
