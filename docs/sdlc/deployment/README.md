# Deployment

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start narrative -->
### DEP-33e15d734bf2 · draft · source: deployment:33e15d734bf2

Version 33e15d734bf2 of the Performance management System (PMS) is recorded as live. The release has a separately hosted frontend and backend. No release metadata beyond status, version, and URLs was provided.

- Project: Performance management System (PMS)
- Deployment status: live
- Version identifier: 33e15d734bf2
- Frontend URL: https://p174f74c26009.d13el1ykvx8z63.amplifyapp.com
- Backend URL: https://54-166-99-17.sslip.io/apps/174f74c26009/
- Deployment date: not provided
- Deployed by / approved by: not provided
- Requirements included in this release: not specified in the deployment input

**Related:** DEP-33e15d734bf2-FE, DEP-33e15d734bf2-BE

- ⚠ No deployment date or timestamp recorded.
- ⚠ No deployer or release approver recorded. Document status is left as 'draft' because no approval is on record.
- ⚠ Target environment is not labelled (e.g. production, staging, or demo). 'Live' alone does not establish that this is production.
- ⚠ No mapping from this release to requirement keys (US-001 to US-035). It is unknown which user stories are included in version 33e15d734bf2.
- ⚠ No post-deployment verification, smoke-test, or health-check results provided.
- ⚠ No rollback plan or previous version recorded.
- ⚠ No release notes or changelog provided for this version.
- ⚠ The format of the version identifier is not described. It may be a commit hash or build id, but this is not confirmed.

### DEP-33e15d734bf2-FE · draft · source: deployment:33e15d734bf2

The frontend for version 33e15d734bf2 is served at an amplifyapp.com URL. The domain suggests AWS Amplify hosting, but the input does not state the hosting platform explicitly.

- Frontend URL: https://p174f74c26009.d13el1ykvx8z63.amplifyapp.com
- Protocol: HTTPS
- Hosting: inferred only from the amplifyapp.com domain (AWS Amplify). Not explicitly stated in the input.
- The id fragment '174f74c26009' in the subdomain also appears in the backend path. This suggests both belong to the same app instance, but the input does not confirm it.

**Related:** DEP-33e15d734bf2

- ⚠ No custom or production domain recorded. Only the platform-generated URL is given.
- ⚠ No confirmation that the frontend is configured to call the recorded backend URL.
- ⚠ Hosting platform, region, and build configuration are not stated in the input.

### DEP-33e15d734bf2-BE · draft · source: deployment:33e15d734bf2

The backend for version 33e15d734bf2 is served from an sslip.io hostname under the path /apps/174f74c26009/. This hostname is a wildcard-DNS name that resolves to IP 54.166.99.17.

- Backend URL: https://54-166-99-17.sslip.io/apps/174f74c26009/
- Protocol: HTTPS
- The hostname uses sslip.io wildcard DNS and maps directly to IP address 54.166.99.17.
- The app is served under a path prefix (/apps/174f74c26009/). This suggests a shared host serving multiple apps, but the input does not confirm it.

**Related:** DEP-33e15d734bf2

- ⚠ The backend is addressed through a raw-IP wildcard DNS name (sslip.io), not a stable domain. It is unclear whether this is the intended long-term endpoint. Confirm DNS and TLS certificate ownership before treating it as production.
- ⚠ No infrastructure details recorded: host type, region, scaling, or database.
- ⚠ No API health-check or verification result recorded for this endpoint.
- ⚠ No record of secrets or configuration management, monitoring, logging, or backup arrangements for the backend.
<!-- sdlc:auto:end narrative -->
