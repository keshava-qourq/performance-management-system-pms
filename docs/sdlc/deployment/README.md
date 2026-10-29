# Deployment

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start narrative -->
### DEP-66559e219ee3 · draft · source: deployment:66559e219ee3

Version 66559e219ee3 of PMS is recorded as live. It has a frontend and a backend endpoint. No date, owner, approval or release scope was provided.

- Project: Performance Management System (PMS)
- Deployment status: live
- Version identifier: 66559e219ee3
- Frontend URL: https://p174f74c26009.d13el1ykvx8z63.amplifyapp.com
- Backend URL: https://54-166-99-17.sslip.io/apps/174f74c26009/
- Not stated in the input: deployment date, who deployed it, who approved it, target environment name (e.g. staging or production), or which requirements this release delivers.

**Related:** DEP-66559e219ee3-FE, DEP-66559e219ee3-BE

- ⚠ No deployment date or timestamp recorded.
- ⚠ No deployer or approver recorded. A formal release approval cannot be confirmed, so this entry stays 'draft'.
- ⚠ The input does not say whether this is a production, staging or demo environment.
- ⚠ Release scope is unknown. The input does not say which of US-001 through US-035 are included, so requirement traceability for this deployment cannot be established.
- ⚠ The version identifier looks like a commit hash, but no build artifact, branch, or development/test phase output is referenced to confirm what code it contains.
- ⚠ No pre- or post-deployment verification (smoke tests, health checks, test sign-off) recorded.
- ⚠ No rollback plan or previous version recorded.
- ⚠ No release notes, known issues, or post-deployment monitoring/alerting details provided.

### DEP-66559e219ee3-FE · draft · source: deployment:66559e219ee3

The PMS frontend for version 66559e219ee3 is served from an AWS Amplify-hosted URL. No other frontend deployment details were provided.

- Frontend URL: https://p174f74c26009.d13el1ykvx8z63.amplifyapp.com
- The hostname uses the amplifyapp.com domain, which indicates AWS Amplify hosting. This is inferred from the URL only.
- Not stated in the input: build configuration, custom domain, CDN or caching settings, environment variables, or the backend endpoint the frontend is configured to call.

**Related:** DEP-66559e219ee3

- ⚠ No custom domain recorded. The app is reachable only on the default Amplify-generated hostname.
- ⚠ The input does not confirm that the frontend is configured to call the recorded backend URL.
- ⚠ No frontend build or branch information recorded.

### DEP-66559e219ee3-BE · draft · source: deployment:66559e219ee3

The PMS backend for version 66559e219ee3 is exposed at a path-based URL on an sslip.io hostname. The hostname maps to the IP address 54.166.99.17. No hosting, scaling or security details were provided.

- Backend URL: https://54-166-99-17.sslip.io/apps/174f74c26009/
- The sslip.io hostname encodes the IP address 54.166.99.17 (wildcard DNS derived from the IP). This is inferred from the URL format only.
- The path segment '/apps/174f74c26009/' matches the identifier in the frontend hostname (p174f74c26009). This suggests both belong to the same app instance, but the input does not confirm it.
- Not stated in the input: hosting platform, runtime, database, scaling, TLS certificate management, health-check endpoint, or logging/monitoring.

**Related:** DEP-66559e219ee3

- ⚠ The backend is addressed by a raw-IP-derived sslip.io hostname rather than a stable domain. The input does not say whether this is intended for production use. Needs human confirmation.
- ⚠ No health-check, monitoring or alerting details recorded.
- ⚠ No database, data migration or backup details recorded for this deployment.
- ⚠ No security or access-control configuration recorded for the backend endpoint.
<!-- sdlc:auto:end narrative -->
