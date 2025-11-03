from hatchet_sdk import Hatchet, ClientConfig, ClientTLSConfig
from pydantic import BaseModel


hatchet = Hatchet(
    config=ClientConfig(
        host_port="host.docker.internal:7077",
        token="eyJhbGciOiJFUzI1NiIsImtpZCI6ImlwejFQQSJ9.eyJhdWQiOiJodHRwOi8vMC4wLjAuMDo4ODg4IiwiZXhwIjoxNzY5OTIxMTA3LCJncnBjX2Jyb2FkY2FzdF9hZGRyZXNzIjoibG9jYWxob3N0OjcwNzciLCJpYXQiOjE3NjIxNDUxMDcsImlzcyI6Imh0dHA6Ly8wLjAuMC4wOjg4ODgiLCJzZXJ2ZXJfdXJsIjoiaHR0cDovLzAuMC4wLjA6ODg4OCIsInN1YiI6IjcwN2QwODU1LTgwYWItNGUxZi1hMTU2LWYxYzQ1NDZjYmY1MiIsInRva2VuX2lkIjoiZTdlNmVkMzYtYjZkYS00YmUxLWIyNTMtMmFlMDc4ZDMyNjk0In0.L7TGh7clpcyTgsT2Jnl9VNKkWs8bS-YHpJy2d-p-JNpM0-p4qTMf_wgaMqIPv60-vqHUp6ivySFWZE3Av6T2iw",
        tls_config=ClientTLSConfig(strategy="none"),
    ),
    debug=True,
)


class ImportMetaInput(BaseModel):
    post_id: int
    url: str


class ImportMetaOutput(BaseModel):
    content: str
    image: str


def start_worker():
    worker = hatchet.worker("worker", slots=8, workflows=[import_html_meta])
    worker.start()


if __name__ == "__main__":
    start_worker()
