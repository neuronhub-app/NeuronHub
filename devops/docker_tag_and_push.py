#!/usr/bin/env python3
# !# /// script
# requires-python = ">=3.11"
# ///

"""
For example output eg run `mise docker:push --tag_only --app=client`

FYI: I'm not often testing py3.11, mostly 3.14.
"""

import argparse
import os
import subprocess
from argparse import Namespace
from typing import Literal

parser = argparse.ArgumentParser()
parser.add_argument("--app", default="server", choices=["server", "client", "coder"])
parser.add_argument("--github_path")
parser.add_argument("--version")
parser.add_argument("--tag_only", action="store_true")


class NamespaceKwargs(Namespace):
    app: Literal["server", "client", "coder"]
    version: str
    github_path: str
    tag_only: bool


def main(kwargs: NamespaceKwargs):
    version_splits = kwargs.version.split(".")

    for tag_version in [
        kwargs.version,
        f"{version_splits[0]}.{version_splits[1]}",  # eg "0.2"
        f"{version_splits[0]}.{version_splits[1]}.{version_splits[2]}",
        "latest",
    ]:
        container_path = f"ghcr.io/{kwargs.github_path}/{kwargs.app}"
        tag_existing = f"{container_path}:{kwargs.version}"
        _docker_run("tag", tag_existing, f"{container_path}:{tag_version}")

        is_push_to_registry = not kwargs.tag_only
        if is_push_to_registry:
            _docker_run("push", f"{container_path}:{tag_version}")


def _docker_run(*args: str):
    if os.environ.get("CI") == "true":
        docker_bin = ["docker"]
    else:
        # local sudo
        docker_bin = ["sudo", "-E", "docker"]
    print("docker", *args)
    subprocess.run([*docker_bin, *args], check=True)


if __name__ == "__main__":
    main(kwargs=parser.parse_args())  # type: ignore[arg-type] #bad-infer
