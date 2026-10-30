# Deployment

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start narrative -->
### DEP-498f20bea4d5 · draft · source: deployment:498f20bea4d5

PMS version 498f20bea4d5 is recorded as live. The release has a frontend and a backend endpoint. No other release metadata was supplied.

- Status: live
- Version: 498f20bea4d5 (the format suggests a short commit hash or build identifier; this is not confirmed in the input)
- Frontend URL: https://p174f74c26009.d13el1ykvx8z63.amplifyapp.com
- Backend URL: https://54-166-99-17.sslip.io/apps/174f74c26009/
- Deployment date, deployer, and approver: not stated in input
- Requirements (US-001 to US-035) delivered in this version: not stated in input

**Related:** DEP-FRONTEND-498f20bea4d5, DEP-BACKEND-498f20bea4d5

- ⚠ No deployment date or timestamp recorded.
- ⚠ No record of who performed or approved the deployment.
- ⚠ No release approval or go/no-go decision recorded.
- ⚠ Target environment is not named (production, staging, or demo); 'live' is the only status given.
- ⚠ No release notes or changelog stating which requirements (US-001 to US-035) or tickets this version includes, so it cannot be traced to requirements.
- ⚠ No pre- or post-deployment verification recorded (smoke tests, health checks, test sign-off).
- ⚠ No rollback plan or previous version recorded.
- ⚠ Version 498f20bea4d5 is not linked to a specific source commit, branch, or build pipeline run in the input.

### DEP-FRONTEND-498f20bea4d5 · draft · source: deployment:498f20bea4d5

The PMS frontend for version 498f20bea4d5 is served from an amplifyapp.com URL. That domain is AWS Amplify's default hosting domain.

- URL: https://p174f74c26009.d13el1ykvx8z63.amplifyapp.com
- Hosting: the amplifyapp.com domain indicates AWS Amplify Hosting, inferred from the URL only
- Served over HTTPS (per the URL scheme)
- Custom domain: none recorded

**Related:** DEP-498f20bea4d5, DEP-BACKEND-498f20bea4d5

- ⚠ No custom or branded domain recorded; the app is on the default Amplify subdomain.
- ⚠ No confirmation that the frontend is configured to call the recorded backend URL.
- ⚠ No record of frontend availability or health verification after deployment.

### DEP-BACKEND-498f20bea4d5 · draft · source: deployment:498f20bea4d5

The PMS backend for version 498f20bea4d5 is served at a path under an sslip.io hostname. sslip.io is a wildcard DNS service that resolves this hostname to IP 54.166.99.17.

- URL: https://54-166-99-17.sslip.io/apps/174f74c26009/
- Hostname: 54-166-99-17.sslip.io, a wildcard DNS name that resolves to IP address 54.166.99.17
- App path: /apps/174f74c26009/. The identifier 174f74c26009 also appears in the frontend subdomain (p174f74c26009), which suggests both belong to the same app instance; this is inferred and not confirmed.
- Served over HTTPS (per the URL scheme)
- Hosting platform, runtime, and database: not stated in input

**Related:** DEP-498f20bea4d5, DEP-FRONTEND-498f20bea4d5

- ⚠ The backend is addressed through an IP-encoded wildcard DNS hostname (sslip.io) rather than a dedicated domain. Whether this is acceptable for the stated environment is not documented and needs human review.
- ⚠ No backend health-check, API smoke-test, or monitoring results recorded.
- ⚠ No database, data migration, or configuration/secrets deployment steps recorded.
- ⚠ Hosting platform, scaling, and backup arrangements are not documented.
<!-- sdlc:auto:end narrative -->
