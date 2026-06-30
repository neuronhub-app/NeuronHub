from datetime import datetime
from random import Random
from zoneinfo import ZoneInfo

from django.conf import settings
from django.core.files.uploadedfile import SimpleUploadedFile
from faker import Faker
from faker.proxy import UniqueProxy  # type: ignore[attr-defined] # Faker's bug

from neuronhub.apps.jobs.tests.test_gen import JobsGen
from neuronhub.apps.orgs.tests.test_gen import OrgsGen
from neuronhub.apps.posts.tests.test_gen import PostsGen
from neuronhub.apps.profiles.tests.test_gen import ProfilesGen
from neuronhub.apps.sites.tests.test_gen import SitesGen
from neuronhub.apps.users.models import User
from neuronhub.apps.users.tests.test_gen import UsersGen


class Gen:
    orgs: OrgsGen
    users: UsersGen
    posts: PostsGen
    profiles: ProfilesGen
    jobs: JobsGen
    sites: SitesGen
    faker: UniqueProxy
    faker_non_unique: Faker
    random_gen_seeded: Random

    # todo refac: rename to `new`? `create` sounds as we'll call User.objects.create(), not get_or_create()
    @classmethod
    async def create(
        cls,
        user_default: User | None = None,
        is_user_default_superuser: bool = True,
    ):
        self = cls()

        faker = Faker()
        self.faker = faker.unique  # faker.unique to avoid non-unique usernames, etc

        faker.seed_instance(42)  # Deterministic: #5 faker.name() -> same #5 name() string
        self.random_gen_seeded = faker.random
        self.faker_non_unique = faker

        self.orgs = OrgsGen(faker=self.faker)
        self.users = await UsersGen.create(
            faker=self.faker,
            is_user_default_superuser=is_user_default_superuser,
            user_default=user_default,
        )
        self.posts = PostsGen(faker=self.faker, user=self.users.user_default)
        self.profiles = ProfilesGen(faker=self.faker, user=self.users.user_default)
        self.jobs = JobsGen(faker=self.faker, orgs=self.orgs)
        self.sites = SitesGen(faker=self.faker)

        return self

    @staticmethod
    def datetime_now(timezone: str = "") -> datetime:
        return datetime.now(
            tz=ZoneInfo(timezone or settings.TIME_ZONE),
        )

    def image(self, content=b"image_content") -> SimpleUploadedFile:
        return SimpleUploadedFile(name="image.jpg", content=content, content_type="image/jpeg")
