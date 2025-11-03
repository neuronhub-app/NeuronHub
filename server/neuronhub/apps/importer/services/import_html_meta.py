import requests
from pydantic import BaseModel
from bs4 import BeautifulSoup


class ImportMetaInput(BaseModel):
    # post_id: int
    url: str


class ImportMetaOutput(BaseModel):
    content: str
    image: str


# @hatchet.task(name="import_html_meta", input_validator=ImportMetaInput)
def import_html_meta(
    args: ImportMetaInput,
    # ctx: Context,
) -> ImportMetaOutput:
    # ctx.log(f"importing <meta> from {args.url}")

    response = requests.get(args.url, timeout=10)

    soup = BeautifulSoup(response.text, "lxml")
    meta_dict = {}
    for meta_tag in soup.find_all("meta"):
        if name := (meta_tag.get("property") or meta_tag.get("name")):
            meta_dict[name] = meta_tag.get("content", "")

    # ctx.log(f"importing meta: {meta_dict}")

    return ImportMetaOutput(
        content=meta_dict.get("og:description") or meta_dict.get("description") or "",  # type: ignore
        image=meta_dict.get("og:image", ""),
    )
