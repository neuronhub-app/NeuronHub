from typing import Annotated
from typing import TYPE_CHECKING

from django.db import models
from strawberry import lazy

if TYPE_CHECKING:
    from neuronhub.apps.posts.graphql.types import PostType
    from neuronhub.apps.posts.graphql.types import PostVoteType
    from neuronhub.apps.posts.graphql.types import PostTagVoteType


_posts_types = lazy("neuronhub.apps.posts.graphql.types")

PostTypeLazy = Annotated["PostType", _posts_types]
PostVoteTypeLazy = Annotated["PostVoteType", _posts_types]
PostTagVoteTypeLazy = Annotated["PostTagVoteType", _posts_types]


class ReviewTagName(models.TextChoices):
    # general
    value = "value", "Value"
    ease_of_use = "ease_of_use", "Ease of use"

    # software
    expectations = "expectations", "Expectations"
    stability = "stability", "Stability"
    controversial = "controversial", "Controversial"
    privacy = "privacy", "Privacy"
    open_source = "open_source", "Open Source"

    # goods
    quality = "quality", "Quality"

    # article
    changed_my_mind = "changed_my_mind", "Changed my mind"
    read_fully = "read_fully", "Read fully"
