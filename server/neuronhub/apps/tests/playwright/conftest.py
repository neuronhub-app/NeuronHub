import logging
import os

import pytest
import subprocess
import time
import requests
from django.conf import settings


logger = logging.getLogger(__name__)


@pytest.fixture(scope="session")
def vite_server():
    vite_server = _vite_process_start()
    yield vite_server
    _vite_process_kill(vite_server)


def pytest_configure(config):
    config.option.liveserver = _test_live_server_url


_test_live_server_url = "localhost:8001"


def _vite_process_start() -> subprocess.Popen:
    vite_env = os.environ.copy()
    vite_env.update({"VITE_SERVER_URL": f"http://{_test_live_server_url}"})

    vite_process = subprocess.Popen(
        ["bun", "run", "dev"],
        cwd=os.path.abspath(settings.BASE_DIR.parent / "client"),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        env=vite_env,
    )
    retries_max = 20
    for _ in range(retries_max):
        try:
            requests.get(settings.CLIENT_URL)
            break
        except requests.exceptions.ConnectionError:
            time.sleep(0.5)
    else:
        vite_process.kill()
        raise RuntimeError("Frontend client failed to start")

    return vite_process


def _vite_process_kill(client_process: subprocess.Popen):
    """
    Opus4 code, didn't read.
    """
    client_process.terminate()
    client_process.wait(timeout=5)
    if client_process.poll() is None:
        client_process.kill()
