from asgiref.sync import sync_to_async

from neuronhub.apps.anonymizer.fields import Visibility
from neuronhub.apps.jobs.models import Job
from neuronhub.apps.tests.test_cases import NeuronTestCase


async def _get_visible_to(job: Job) -> list[str]:
    return await sync_to_async(job.get_visible_to)()


class AlgoliaModelGetVisibleToTest(NeuronTestCase):
    async def test_users_selected_includes_author_and_two_selected(self):
        author = await self.gen.users.user()
        selected_1 = await self.gen.users.user()
        selected_2 = await self.gen.users.user()

        job = await self.gen.jobs.job(visibility=Visibility.USERS_SELECTED)
        await sync_to_async(lambda: Job.objects.filter(id=job.id).update(author=author))()
        job = await Job.objects.aget(id=job.id)
        await job.visible_to_users.aadd(selected_1, selected_2)

        visible_to = await _get_visible_to(job)
        assert author.username in visible_to, "author missing from base visible_to"
        assert {selected_1.username, selected_2.username} <= set(visible_to), (
            "2+ selected users missing from base visible_to"
        )

    async def test_private_returns_author_only(self):
        author = await self.gen.users.user()
        job = await self.gen.jobs.job(visibility=Visibility.PRIVATE)
        await sync_to_async(lambda: Job.objects.filter(id=job.id).update(author=author))()
        job = await Job.objects.aget(id=job.id)

        visible_to = await _get_visible_to(job)
        assert visible_to == [author.username]

    async def test_public_returns_group_token(self):
        job = await self.gen.jobs.job(visibility=Visibility.PUBLIC)
        visible_to = await _get_visible_to(job)
        assert visible_to == ["group/public"]
