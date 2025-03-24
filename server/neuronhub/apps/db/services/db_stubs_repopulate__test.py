from neuronhub.apps.db.services.db_stubs_repopulate import db_stubs_repopulate
from neuronhub.apps.tests.test_cases import NeuronTestCase
from neuronhub.apps.tools.models import ToolReview


class DbStubsRepopulateTest(NeuronTestCase):
    async def test_repopulate(self):
        await db_stubs_repopulate()
        print(await ToolReview.objects.all().afirst())
