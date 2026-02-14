from django.db.models import Case, F, QuerySet, Value, When
from django.db.models.functions import Coalesce

from neuronhub.apps.profiles.models import Profile
from neuronhub.apps.profiles.services.filter_profiles_by_user import filter_profiles_by_user
from neuronhub.apps.users.models import User


# #AI
def get_profiles_queryset_sorted_by_match(
    user: User,
    sort: str,
) -> QuerySet[Profile]:
    """Return profiles queryset sorted by user's personal match scores. Pagination is handled by caller."""
    if sort == "llm_score":
        score_field = "match__match_score_by_llm"
    elif sort == "user_score":
        score_field = "match__match_score"
    else:
        raise ValueError(f"Invalid sort: {sort}")

    return (
        filter_profiles_by_user(user)
        .annotate(
            sort_score=Case(
                When(match__user=user, then=Coalesce(F(score_field), Value(-1))),
                default=Value(-1),
            ),
        )
        .order_by("-sort_score", "-created_at")
    )
