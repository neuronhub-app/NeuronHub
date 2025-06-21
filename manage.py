# If LLM forgets `cd server/`

#!/usr/bin/env python

import subprocess
import sys
from pathlib import Path

server_dir = Path(__file__).parent / "server"
result = subprocess.run(["uv", "run", "manage.py"] + sys.argv[1:], cwd=server_dir)
sys.exit(result.returncode)
