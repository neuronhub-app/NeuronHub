from dataclasses import dataclass

from faker.proxy import UniqueProxy  # type: ignore[attr-defined] # Faker's bug

from neuronhub.apps.sites.models import SeoMeta


@dataclass
class SitesGen:
    faker: UniqueProxy

    async def seo_meta(
        self,
        path: str = "",
        meta_title: str = "",
        meta_description: str = "",
        meta_image_url: str = "",
    ) -> SeoMeta:
        return await SeoMeta.objects.acreate(
            path=path or self.faker.uri_path(),
            meta_title=meta_title,
            meta_description=meta_description,
            meta_image_url=meta_image_url,
        )
