from neuronhub.apps.posts.models import Post
from neuronhub.apps.posts.models import PostToolStatsGithub


async def import_github_tool(url_raw: str) -> Post:
    url = _clean_url(url_raw)
    tool, is_created = await Post.objects.aget_or_create(github_url=url)

    stats, _ = await PostToolStatsGithub.objects.aget_or_create(tool=tool)
    stats.stars = 0
    stats.kloc = 0
    await stats.asave()

    return tool


def _clean_url(url: str) -> str:
    url = url.strip().lower()
    if url.endswith("/"):
        url = url[:-1]

    if ".git" in url:
        url = url.replace(".git", "")

    return url
