#!/usr/bin/env python3
#!# /// script
# requires-python = ">=3.11"
# ///

"""
Tag & push version full, major, and latest. Eg for 1.1.1.0 push:
- 1.1.1.0
- 1.1
- latest
"""

import sys
import subprocess
import getopt

opts_tuple, _ = getopt.getopt(sys.argv[1:], "", ["app=", "github-path=", "version="])
opts = dict(opts_tuple)

version_parts = opts["--version"].split(".")
version_major = f"{version_parts[0]}.{version_parts[1]}"

tag_base = f"ghcr.io/{opts['--github-path']}/{opts['--app']}"
tag_full = f"{tag_base}:{opts['--version']}"

subprocess.run(["sudo", "docker", "push", tag_full])

for version in [version_major, "latest"]:
    subprocess.run(["sudo", "docker", "tag", tag_full, f"{tag_base}:{version}"])
    subprocess.run(["sudo", "docker", "push", f"{tag_base}:{version}"])
