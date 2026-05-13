# Security Policy

## Supported Versions

County Pulse is pre-1.0 and under active development. Security fixes should target the current `main` branch unless a release branch is created later.

## Reporting a Vulnerability

Do not publish exploit details, credentials, workbook data, or private URLs in a public issue.

Open a GitHub issue titled `Security report request` with only a brief summary and the affected version or hosted URL:

`https://github.com/gbuckleyjr/county-pulse-extension/issues`

The maintainer will arrange private follow-up before technical details are shared.

## Security Posture

County Pulse is a static, client-side Tableau viz extension. It:

- reads Tableau worksheet summary data through the Extensions API
- stores UI preferences through Tableau extension settings
- fetches bundled static assets from the hosted project
- does not request underlying data permissions in the `.trex` manifest
- does not send workbook data to external APIs
- does not include analytics or tracking code

Administrators should still review and safelist the hosted extension URL according to their Tableau Cloud or Tableau Server policies.
