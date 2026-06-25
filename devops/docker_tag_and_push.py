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
parser.add_argument("--app", default="server", choices=["server", "client", "docs", "coder"])
parser.add_argument("--vite_site", default="", choices=["", "pg"])
parser.add_argument("--django_env", default="", choices=["", "prod", "stage", "dev"])
parser.add_argument("--ghcr_repo")
parser.add_argument("--version")
parser.add_argument("--tag_only", action="store_true")
parser.add_argument("--pre_release", action="store_true")


type ViteSite = Literal["", "pg"]
type DjangoEnv = Literal["", "prod", "stage", "dev"]


class NamespaceKwargs(Namespace):
    app: Literal["server", "client", "docs", "coder"]
    vite_site: ViteSite
    django_env: DjangoEnv
    version: str
    ghcr_repo: str
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

    image_name = kwargs.app
    if kwargs.app == "client":
        image_name = _get_client_image_name(kwargs.vite_site, kwargs.django_env)
    container_path = f"ghcr.io/{kwargs.ghcr_repo}/{image_name}"

    for tag_version in tag_versions:
        subprocess.run(
            [
                "docker",
                "tag",
                f"{container_path}:{kwargs.version}",
                f"{container_path}:{tag_version}",
            ],
            check=True,
        )
        is_push_to_registry = not kwargs.tag_only
        if is_push_to_registry:
            subprocess.run(
                ["docker", "push", f"{container_path}:{tag_version}"],
                check=True,
            )


def _get_client_image_name(vite_site: ViteSite, django_env: DjangoEnv) -> str:
    site_suffix = f"-{vite_site}" if vite_site else ""
    stage_postfix = "-stage" if django_env == "stage" else ""
    return f"client{site_suffix}{stage_postfix}"


if __name__ == "__main__":
    main(kwargs=parser.parse_args())  # type: ignore[arg-type] #bad-infer
