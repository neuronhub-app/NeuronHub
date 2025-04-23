from __future__ import annotations

from typing import Annotated
from typing import TYPE_CHECKING

from strawberry import lazy

if TYPE_CHECKING:
    from neuronhub.apps.posts.graphql.types import PostType
    from neuronhub.apps.posts.graphql.types import PostVoteType


_posts_types = lazy("neuronhub.apps.posts.graphql.types")

PostTypeLazy: PostType = Annotated["PostType", _posts_types]
PostVoteTypeLazy: PostVoteType = Annotated["PostVoteType", _posts_types]
