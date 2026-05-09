from dataclasses import dataclass

from faker.proxy import UniqueProxy  # type: ignore[attr-defined] # Faker's bug

from neuronhub.apps.orgs.models import Org


@dataclass
class OrgsGen:
    faker: UniqueProxy

    async def create(self, is_highlighted: bool = False):
        domain = self.faker.domain_name()
        return await Org.objects.acreate(
            name=self.faker.company(),
            website=domain,
            domain=domain,
            is_highlighted=is_highlighted,
        )
