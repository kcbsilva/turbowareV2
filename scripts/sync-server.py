#!/usr/bin/env python3
"""Run one queued TurboWare sync through an existing systemd deployment unit."""
import argparse
import json
import os
from pathlib import Path
import subprocess
import time
import urllib.error
import urllib.request
from urllib.parse import urlsplit


DEPLOYMENTS = {
    "turbovpn": {
        "TurboVPN": ("turbovpn", "/opt/turboisp/src/TurboVPN-GO", "main"),
        "TurboRADIUS": ("turboradius", "/opt/turboisp/src/TurboRADIUS-GO", "master"),
    },
    "turboisp-api": {
        "TurboISP-API": ("turboisp-api", "/opt/turboisp/turboisp-api", "main"),
    },
}


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def request(url, token, method, payload=None):
    data = json.dumps(payload).encode() if payload is not None else b""
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        method=method,
    )
    with urllib.request.build_opener(NoRedirect()).open(req, timeout=15) as response:
        if response.status == 204:
            return None
        if method == "POST" and response.status == 200:
            return json.load(response)
        raise RuntimeError(f"Unexpected sync response: HTTP {response.status}")


def deploy(unit, checkout, branch):
    try:
        subprocess.run(["systemctl", "start", f"turbo-gitsync@{unit}.service"],
                       check=True, timeout=900)
        upstream = subprocess.check_output(
            ["git", "-C", checkout, "rev-parse", "--verify", f"refs/remotes/origin/{branch}"],
            text=True, timeout=10
        ).strip()
        deployed = Path(f"/var/lib/turboisp-gitsync/{unit}.sha").read_text().strip()
    except (OSError, subprocess.SubprocessError) as error:
        print(f"Deployment check failed for {unit}: {error}", flush=True)
        return False
    if deployed != upstream:
        print(f"{unit}: deployed commit {deployed} differs from {upstream}", flush=True)
        return False
    return True


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("server", choices=DEPLOYMENTS)
    parser.add_argument("origin", help="TurboWare HTTPS origin")
    args = parser.parse_args()
    origin = urlsplit(args.origin)
    if (origin.scheme != "https" or not origin.hostname or origin.username is not None
            or origin.path not in ("", "/") or origin.query or origin.fragment):
        parser.error("origin must be a TurboWare HTTPS origin")
    token = os.environ.pop("SERVER_SYNC_TOKEN", "")
    if not token:
        parser.error("SERVER_SYNC_TOKEN is required")

    endpoint = f"{args.origin.rstrip('/')}/api/server-report/{args.server}/sync"
    job = request(endpoint, token, "POST")
    if job is None:
        return

    target = DEPLOYMENTS[args.server].get(job["repository"])
    succeeded = bool(target and deploy(*target))
    try:
        subprocess.run(["systemctl", "start", f"turboware-report@{args.server}.service"],
                       check=True, timeout=90)
    except subprocess.SubprocessError as error:
        print(f"Could not refresh the server report: {error}", flush=True)

    for attempt in range(3):
        try:
            request(endpoint, token, "PATCH", {"requestId": job["requestId"], "succeeded": succeeded})
            return
        except (urllib.error.URLError, TimeoutError):
            if attempt == 2:
                raise
            time.sleep(2)


if __name__ == "__main__":
    main()
