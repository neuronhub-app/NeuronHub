from neuronhub.apps.db.services.db_stubs_repopulate import db_stubs_repopulate
from neuronhub.apps.posts.models import Post
from neuronhub.apps.tests.test_cases import NeuronTestCase


class DbStubsRepopulateTest(NeuronTestCase):
    async def test_repopulate(self):
        await db_stubs_repopulate()
        assert await Post.reviews.all().afirst()
