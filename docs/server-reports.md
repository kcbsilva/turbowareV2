# Servers settings

Admin → Settings → Servers shows the latest Linux snapshot received from each
droplet. Reports become stale after 15 minutes. CPU is sampled over one second,
RAM usage uses Linux's available-memory estimate, and disk usage covers the root
filesystem. Git sync compares the checkout's HEAD with the current tip of its
configured remote branch. The page shows working-tree changes separately.

## Connect the reporters

1. Apply the Prisma migration with `npx prisma migrate deploy` and deploy TurboWare
   with two independently generated bearer tokens. Use
   `SERVER_REPORT_TURBOVPN_TOKEN` and `SERVER_REPORT_TURBOISP_API_TOKEN` in the
   web app environment.
2. Copy `scripts/report-server.py` to both Linux droplets. Run it under the
   account that can read the deployment checkouts and has read access to their
   Git remotes. Configure the host's usual Git credentials and SSH known hosts
   for unattended access if needed.
3. On each droplet, create a JSON file with the deployed checkout paths and the
   remote branches each deployment tracks. Replace the example paths and refs
   with the actual values. The `remote` property is optional and defaults to
   `origin`.

TurboVPN droplet:

```json
{
  "TurboVPN": { "path": "/srv/turbovpn", "ref": "refs/heads/main" },
  "TurboRADIUS": { "path": "/srv/turboradius", "ref": "refs/heads/main" }
}
```

TurboISP-API droplet:

```json
{
  "TurboISP-API": { "path": "/srv/turboisp-api", "ref": "refs/heads/main" }
}
```

4. Store `SERVER_REPORT_TOKEN=<matching token>` in a file readable only by the
   reporting account, such as `/etc/turboware/report.env` with mode 0600. Schedule
   the command every five minutes with the account's crontab. Use the final HTTPS
   origin, the local JSON file, and the matching server ID (`turbovpn` or
   `turboisp-api`).

```cron
*/5 * * * * set -a; . /etc/turboware/report.env && /usr/bin/python3 /opt/turboware/report-server.py turbovpn https://your-turboware-origin.example /etc/turboware/repos.json
```

Run the command once before scheduling it, then open the Servers tab and check
that each displayed commit matches the intended checkout. The report describes
the deployed source checkout. If you build a binary or image from that checkout,
the reported commit follows the checkout even when the running artifact predates it.
