# Deployment

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start narrative -->
### DEP-0b3e2f34c2bb · draft · source: deployment:0b3e2f34c2bb

Version 0b3e2f34c2bb of the Performance Management System (PMS) is recorded as live. It consists of a frontend web app and a backend service, each with its own public URL. No other release metadata was provided.

Recorded facts:
- Project: Performance management System (PMS)
- Deployment status: live
- Version: 0b3e2f34c2bb. This is a 12-character hex string that resembles a short commit hash; the input does not confirm this.
- Frontend URL: https://p174f74c26009.d13el1ykvx8z63.amplifyapp.com (see DEP-0b3e2f34c2bb-FE)
- Backend URL: https://54-166-99-17.sslip.io/apps/174f74c26009/ (see DEP-0b3e2f34c2bb-BE)

Observation: the identifier 174f74c26009 appears in both the frontend subdomain and the backend path. This suggests both components belong to the same app instance.

Not stated in input: who deployed, when, who approved it, or why.

**Related:** DEP-0b3e2f34c2bb-FE, DEP-0b3e2f34c2bb-BE

- ⚠ No deployment date or timestamp recorded.
- ⚠ No deployer or approver recorded. Status is left as 'draft' because no release approval or sign-off was provided.
- ⚠ Target environment not named. 'live' does not confirm whether this is production, staging or a demo environment.
- ⚠ No release notes or changelog. It is unknown which requirements (US-001 to US-035) are included, so none are linked in related_ids.
- ⚠ No link to testing-phase results or a QA sign-off for this version.
- ⚠ No previous version recorded, so it cannot be determined whether an earlier release was superseded.
- ⚠ No rollback plan or procedure documented.
- ⚠ No post-deployment smoke test or health-check results provided.
- ⚠ No monitoring, alerting, logging or incident-response arrangements documented.
- ⚠ No database or schema migration information for this release.
- ⚠ Unconfirmed: whether 0b3e2f34c2bb maps to a specific source-control commit or build artifact.

### DEP-0b3e2f34c2bb-FE · draft · source: deployment:0b3e2f34c2bb

The PMS frontend for version 0b3e2f34c2bb is served at an amplifyapp.com URL. This is the entry point end users would open in a browser.

- URL: https://p174f74c26009.d13el1ykvx8z63.amplifyapp.com
- Protocol: HTTPS
- Hosting: the amplifyapp.com domain indicates AWS Amplify Hosting. This is inferred from the hostname and is not stated in the input.
- Domain: default platform-generated domain; no custom domain recorded.

**Related:** DEP-0b3e2f34c2bb, DEP-0b3e2f34c2bb-BE

- ⚠ No custom or branded domain recorded. Users access the app through a platform-generated hostname.
- ⚠ Login or authentication entry point and user access provisioning not documented.
- ⚠ Supported browsers and devices not documented.
- ⚠ Unconfirmed: whether this frontend is configured to call the backend URL in DEP-0b3e2f34c2bb-BE (API base URL and environment configuration not provided).

### DEP-0b3e2f34c2bb-BE · draft · source: deployment:0b3e2f34c2bb

The PMS backend for version 0b3e2f34c2bb is reachable over HTTPS at an sslip.io hostname under a per-app path. The hostname encodes a raw IP address rather than a dedicated domain.

- URL: https://54-166-99-17.sslip.io/apps/174f74c26009/
- Protocol: HTTPS
- Hostname: sslip.io is a wildcard DNS service that resolves to the IP embedded in the name, here 54.166.99.17.
- Path: /apps/174f74c26009/. The path-based app segment suggests a shared host serving several apps; this is not confirmed by the input.

**Related:** DEP-0b3e2f34c2bb, DEP-0b3e2f34c2bb-FE

- ⚠ The backend uses an IP-based sslip.io hostname instead of a dedicated domain. If the host IP changes, the URL changes too. Confirm whether this is acceptable for a live release.
- ⚠ TLS certificate source and renewal arrangement not documented.
- ⚠ Unconfirmed: whether the host is shared with other applications, and what isolation is in place.
- ⚠ No API documentation, health-check endpoint or version endpoint provided.
- ⚠ CORS configuration allowing the frontend origin not documented.
- ⚠ Backend runtime, data store, backups and scaling configuration not documented.
- ⚠ Secrets and credentials management for this deployment not documented.
<!-- sdlc:auto:end narrative -->
