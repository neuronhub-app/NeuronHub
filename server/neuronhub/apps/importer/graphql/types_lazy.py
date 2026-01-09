from typing import Annotated

import strawberry

UserSourceTypeLazy = Annotated[
    "UserSourceType",
    strawberry.lazy("neuronhub.apps.importer.graphql.types"),  # type: ignore[name-defined] #bad-infer
]
