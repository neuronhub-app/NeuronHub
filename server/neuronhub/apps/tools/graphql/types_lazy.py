from __future__ import annotations

import typing
from typing import Annotated

import strawberry


if typing.TYPE_CHECKING:
    from neuronhub.apps.tools.graphql.types import ToolType


# Used to work. Prob a bug, I'll wait
ToolTypeLazy = Annotated[ToolType, strawberry.lazy(".types")]
