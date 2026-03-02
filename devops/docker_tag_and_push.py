#!/usr/bin/env python3
# !# /// script
# requires-python = ">=3.14"
# ///

"""
See [[docker.mise.toml]]
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
parser.add_argument("--pre_release", action="store_true")


class NamespaceKwargs(Namespace):
    app: Literal["server", "client", "coder"]
    version: str
    github_path: str
    tag_only: bool
    pre_release: bool
    no_sudo: bool


def main(kwargs: NamespaceKwargs):
    version_splits = kwargs.version.split(".")

    if kwargs.pre_release:
        tag_versions = [kwargs.version]
    else:
        tag_versions = [
            kwargs.version,
            f"{version_splits[0]}.{version_splits[1]}",  # eg "0.2"
            f"{version_splits[0]}.{version_splits[1]}.{version_splits[2]}",
            "latest",
        ]

    for tag_version in tag_versions:
        container_path = f"ghcr.io/{kwargs.github_path}/{kwargs.app}"
        tag_existing = f"{container_path}:{kwargs.version}"
        subprocess.run(
            ["docker", "tag", tag_existing, f"{container_path}:{tag_version}"],
            check=True,
        )
        is_push_to_registry = not kwargs.tag_only
        if is_push_to_registry:
            subprocess.run(
                ["docker", "push", f"{container_path}:{tag_version}"],
                check=True,
            )


if __name__ == "__main__":
    main(kwargs=parser.parse_args())  # type: ignore[arg-type] #bad-infer
