from django.contrib.auth.models import AnonymousUser

from neuronhub.apps.tests.test_cases import NeuronTestCase
from neuronhub.apps.users.graphql.resolvers import build_algolia_visibility_filters


class AlgoliaVisibilityFiltersTest(NeuronTestCase):
    async def test_anonymous_gets_only_public(self):
        filters = await build_algolia_visibility_filters(AnonymousUser())
        assert filters == ["visible_to:group/PUBLIC"], (
            "anonymous user got more than PUBLIC — can see INTERNAL"
        )
        assert "visible_to:group/INTERNAL" not in filters

    async def test_authenticated_gets_internal_and_personal_token(self):
        user = await self.gen.users.user()
        filters = await build_algolia_visibility_filters(user)
        assert "visible_to:group/PUBLIC" in filters
        assert "visible_to:group/INTERNAL" in filters
        assert f"visible_to:{user.username}" in filters
