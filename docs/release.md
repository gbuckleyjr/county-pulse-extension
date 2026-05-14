# Hosting and Release Policy

Status date: 2026-05-14

## Hosting Decision

GitHub Pages is sufficient for the current Tableau Exchange review candidate because County Pulse is a static HTTPS app with bundled assets, no server-side state, no runtime API calls, and no private credentials. Move to a more controlled HTTPS host only if Tableau requires a custom domain, stricter cache headers, uptime guarantees, or an immutable app URL per submitted version.

## Production URLs

- Production app URL: `https://gbuckleyjr.github.io/county-pulse-extension/index.html`
- Production manifest URL: `https://gbuckleyjr.github.io/county-pulse-extension/CountyPulse.trex`
- Repository: `https://github.com/gbuckleyjr/county-pulse-extension`

`CountyPulse.trex` must point at the production app URL unless a future versioned release folder is introduced.

## Stable Submitted Builds

For any Tableau-submitted build:

1. Bump `extension-version` in `CountyPulse.trex`.
2. Update `docs/manifest.md` with the same version.
3. Commit the release candidate.
4. Tag the commit as `vX.Y.Z`.
5. Create a GitHub Release for the tag.
6. Attach the exact submitted `CountyPulse.trex` to the release.
7. Keep the tag and release asset unchanged.

Submitted versions must remain available through the GitHub tag and release asset. Do not force-push or retag submitted versions.

## Versioning Rules

- Patch: documentation, copy, icon, metadata, or compatibility fixes with no visual behavior change.
- Minor: new controls, changed encodings, changed rendering behavior, or new author-facing workflow.
- Major: first Exchange-ready `1.0.0` or later breaking behavior change.

Do not change production behavior without a matching manifest version bump. If a change is visible to Tableau authors, bump before submission.

## Reviewer Download Path

For current review, a reviewer can use:

- Hosted manifest: `https://gbuckleyjr.github.io/county-pulse-extension/CountyPulse.trex`
- Hosted app loaded by manifest: `https://gbuckleyjr.github.io/county-pulse-extension/index.html`

After a tagged release exists, include the GitHub Release URL in Tableau submission notes and attach the submitted `.trex` there.

## Pre-1.0 Release Checklist

- `CountyPulse.trex` version bumped.
- `docs/manifest.md` version matches manifest.
- Hosted app and manifest return HTTP 200.
- `node --check src/county-pulse.js` passes.
- `.trex` parses as XML.
- `git diff --check` passes.
- Demo CSVs have `County FIPS`, `Signed Value`, `Magnitude`, and `Label` fields.
- Demo CSVs have no state-total FIPS rows such as `01000`.
- Tableau Desktop local manifest test recorded in `docs/validation.md`.
- Tableau Desktop hosted manifest test recorded in `docs/validation.md`.
- Tableau Public authoring/publishing result recorded in `docs/validation.md`.
- Exchange screenshots recaptured or confirmed current.
- `docs/submission.md` outreach links reviewed.
- Git tag and GitHub Release created for the submitted build.

## Rollback

If a submitted build has a blocking issue, create a new patch version instead of mutating the old release. Keep the rejected build available for audit and Tableau review history.
