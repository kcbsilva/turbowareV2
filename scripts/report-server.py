#!/usr/bin/env python3
"""Collect a Linux droplet snapshot and report it to TurboWare."""
import argparse
import json
import os
from pathlib import Path
import subprocess
import time
import urllib.request
from urllib.parse import urlsplit


REPOSITORIES = {
    "turbovpn": ("TurboVPN", "TurboRADIUS"),
    "turboisp-api": ("TurboISP-API",),
}


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def cpu_ticks():
    with open("/proc/stat") as stats:
        ticks = [int(tick) for tick in stats.readline().split()[1:9]]
    return sum(ticks), ticks[3] + ticks[4]


def metrics():
    total_before, idle_before = cpu_ticks()
    time.sleep(1)
    total, idle = cpu_ticks()
    elapsed = total - total_before
    cpu = 100 * (elapsed - (idle - idle_before)) / elapsed if elapsed > 0 else 0

    memory = {}
    for line in Path("/proc/meminfo").read_text().splitlines():
        key, value = line.split(":", 1)
        if key in ("MemTotal", "MemAvailable"):
            memory[key] = int(value.split()[0]) * 1024

    disk = os.statvfs("/")
    return {
        "cpuPercent": round(min(100, max(0, cpu)), 1),
        "cpuCount": os.cpu_count() or 1,
        "ramUsed": memory["MemTotal"] - memory["MemAvailable"],
        "ramTotal": memory["MemTotal"],
        "diskUsed": (disk.f_blocks - disk.f_bfree) * disk.f_frsize,
        "diskTotal": disk.f_blocks * disk.f_frsize,
        "uptimeSeconds": int(float(Path("/proc/uptime").read_text().split()[0])),
    }


def git(path, *args):
    try:
        return subprocess.check_output(
            ["git", "-C", path, *args],
            stderr=subprocess.DEVNULL,
            text=True,
            timeout=15,
            env={**os.environ, "GIT_TERMINAL_PROMPT": "0", "GIT_OPTIONAL_LOCKS": "0",
                 "GIT_SSH_COMMAND": "ssh -o BatchMode=yes"},
        ).strip()
    except (OSError, subprocess.SubprocessError):
        return None


def repository(name, path, ref, remote):
    head = git(path, "rev-parse", "--verify", "HEAD")
    status = git(path, "status", "--porcelain") if head else None
    remote_line = git(path, "ls-remote", "--exit-code", "--refs", "--", remote, ref) if head else None
    upstream, _, matched_ref = (remote_line or "").partition("\t")
    return {
        "name": name,
        "head": head,
        "upstream": upstream if matched_ref == ref else None,
        "ref": ref,
        "dirty": bool(status) if status is not None else None,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("server", choices=REPOSITORIES)
    parser.add_argument("origin", help="TurboWare HTTPS origin")
    parser.add_argument("config", type=Path, help="JSON file mapping repository names to path and ref")
    args = parser.parse_args()
    origin = urlsplit(args.origin)
    if (origin.scheme != "https" or not origin.hostname or origin.username is not None
            or origin.path not in ("", "/") or origin.query or origin.fragment):
        parser.error("origin must be a TurboWare HTTPS origin")
    token = os.environ.pop("SERVER_REPORT_TOKEN", "")
    if not token:
        parser.error("SERVER_REPORT_TOKEN is required")

    config = json.loads(args.config.read_text())
    repositories = []
    for name in REPOSITORIES[args.server]:
        checkout = config[name]
        ref = checkout["ref"]
        if not ref.startswith("refs/heads/") or not Path(checkout["path"]).is_absolute():
            parser.error(f"{name} requires a refs/heads/ branch and an absolute checkout path")
        repositories.append(repository(name, checkout["path"], ref, checkout.get("remote", "origin")))

    payload = {**metrics(), "repositories": repositories}
    request = urllib.request.Request(
        f"{args.origin.rstrip('/')}/api/server-report/{args.server}",
        data=json.dumps(payload).encode(),
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.build_opener(NoRedirect()).open(request, timeout=15) as response:
        if response.status != 204:
            raise RuntimeError(f"Unexpected report response: HTTP {response.status}")


if __name__ == "__main__":
    main()
