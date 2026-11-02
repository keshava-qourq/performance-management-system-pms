# Deployment

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start narrative -->
### DEPLOY-9c9667efe1d4 · draft · source: deployment:9c9667efe1d4

The Performance Management System (PMS) is recorded as live at version 9c9667efe1d4. The deployment has a separate frontend and backend endpoint. No other release metadata was provided.

- Project: Performance management System (PMS)
- Deployment status (as reported): live
- Version identifier: 9c9667efe1d4 (12-character hex string; likely a short commit hash or build ID, but this is not stated in the input)
- Frontend URL: https://p174f74c26009.d13el1ykvx8z63.amplifyapp.com
- Backend URL: https://54-166-99-17.sslip.io/apps/174f74c26009/
- Entry status is 'draft' because the input records the deployment as live but includes no approval or sign-off.

**Related:** DEPLOY-9c9667efe1d4-FE, DEPLOY-9c9667efe1d4-BE

- ⚠ No deployment date or time recorded.
- ⚠ No deployer or approver recorded; no release approval or sign-off provided.
- ⚠ Target environment not labeled (production, staging, or demo); 'live' alone does not confirm it is production.
- ⚠ Version identifier type not stated (commit hash, build ID, or tag); no link to a source branch or tag.
- ⚠ No release notes or change list; no mapping of which requirements (US-001 to US-035) are included in this release.
- ⚠ No pre-deployment test results or QA sign-off referenced.
- ⚠ No rollback plan or previous version recorded.
- ⚠ No post-deployment smoke test, health check, or monitoring/alerting details recorded.
- ⚠ No configuration, secrets-management, or infrastructure details recorded.

### DEPLOY-9c9667efe1d4-FE · draft · source: deployment:9c9667efe1d4

The frontend for version 9c9667efe1d4 is served from an AWS Amplify-hosted URL. This is the URL end users would open to use the application.

- Frontend URL: https://p174f74c26009.d13el1ykvx8z63.amplifyapp.com
- Hosting: the amplifyapp.com domain indicates AWS Amplify Hosting. The input does not state the hosting provider explicitly.
- Protocol: HTTPS

**Related:** DEPLOY-9c9667efe1d4

- ⚠ No custom domain recorded; unclear whether the default Amplify domain is the intended end-user URL.
- ⚠ No frontend build details recorded (framework, build command, environment variables).
- ⚠ No confirmation that the frontend is configured to call the recorded backend URL.

### DEPLOY-9c9667efe1d4-BE · draft · source: deployment:9c9667efe1d4

The backend for version 9c9667efe1d4 is reachable over HTTPS at an sslip.io hostname under the path /apps/174f74c26009/. The hostname resolves to the IP address 54.166.99.17.

- Backend URL: https://54-166-99-17.sslip.io/apps/174f74c26009/
- Hostname pattern: sslip.io is a wildcard DNS service. '54-166-99-17.sslip.io' resolves to IP 54.166.99.17. That IP is likely an AWS EC2 address, but the input does not state this.
- Path prefix /apps/174f74c26009/ suggests the backend is one app among several on a shared host. This is inferred, not stated.
- Identifier '174f74c26009' appears in both the backend path and the frontend subdomain (p174f74c26009), suggesting a common app/project ID. This is not confirmed by the input.

**Related:** DEPLOY-9c9667efe1d4

- ⚠ The backend is addressed through a wildcard-DNS hostname tied to a raw IP. Confirm whether this is intended for a live or production deployment and whether the IP is static.
- ⚠ No backend runtime, server, or container details recorded.
- ⚠ No database or data-store deployment details recorded (location, migrations applied, backups).
- ⚠ No API health-check endpoint or uptime monitoring recorded.
- ⚠ No authentication, CORS, or TLS certificate details recorded for the backend.
<!-- sdlc:auto:end narrative -->
