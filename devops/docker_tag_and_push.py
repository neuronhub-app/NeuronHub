#!/usr/bin/env python3
#!# /// script
# requires-python = ">=3.11"
# ///

"""
For example output eg run `mise docker:push --tag_only --app=client`
"""

import argparse
import subprocess
from argparse import Namespace
from typing import Literal

parser = argparse.ArgumentParser()
parser.add_argument("--app", default="server", choices=["server", "client", "coder"])
parser.add_argument("--github_path")
parser.add_argument("--version")
parser.add_argument("--tag_only", action="store_true")


class NamespaceOpts(Namespace):
    app: Literal["server", "client", "coder"]
    version: str
    github_path: str
    tag_only: bool


def main(opts: NamespaceOpts):
    is_push_to_registry = not opts.tag_only

    version_splits = opts.version.split(".")
    version_major = f"{version_splits[0]}.{version_splits[1]}"  # eg "0.2"

    for version in [opts.version, version_major, "latest"]:
        container_path = f"ghcr.io/{opts.github_path}/{opts.app}"
        tag_existing = f"{container_path}:{opts.version}"
        _docker_run("tag", tag_existing, f"{container_path}:{version}")
        if is_push_to_registry:
            _docker_run("push", f"{container_path}:{version}")


def _docker_run(*args: str):
    docker = ["sudo", "-E", "docker"]
    print("docker", *args)
    subprocess.run([*docker, *args])


if __name__ == "__main__":
    # noinspection PyTypeChecker
    main(opts=parser.parse_args())
