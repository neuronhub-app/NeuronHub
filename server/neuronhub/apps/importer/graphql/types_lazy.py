from typing import TYPE_CHECKING
from typing import Annotated

from strawberry import lazy


if TYPE_CHECKING:
    from neuronhub.apps.importer.graphql.types import UserSourceType


UserSourceTypeLazy = Annotated["UserSourceType", lazy("neuronhub.apps.importer.graphql.types")]
