# Tableau Exchange and Public Submission Path

Status date: 2026-05-14

## Current Goal

Submit County Pulse for Tableau review so it can become a trusted Exchange listing and get a clear answer on Tableau Public compatibility.

## Current Submission Status

- Community Portal PR: `https://github.com/tableau/extensions-api/pull/635`
- PR target branch: `gh-pages`, because the live Community Portal files currently live under `website/static/community/` on that branch.
- PR contents: `community_extensions.json` entry and `CommunityManifests/CountyPulse.trex`.
- Exchange contributor email: not sent from this repo.

## Official Tableau References

- Extension Gallery submission guide: `https://tableau.github.io/extensions-api/docs/ux_extension_gallery/`
- Tableau Exchange: `https://exchange.tableau.com/`
- Viz Extension docs: `https://help.tableau.com/current/pro/desktop/en-us/viz_extensions.htm`
- Tableau Extensions API docs: `https://tableau.github.io/extensions-api/`

## Contributor Path

Tableau's Extension Gallery guide says contributors must be added before they can submit extensions. The documented contact path is `extensiongallery@tableau.com`.

## Repo Links for Review

- Extension app: `https://gbuckleyjr.github.io/county-pulse-extension/index.html`
- Manifest: `https://gbuckleyjr.github.io/county-pulse-extension/CountyPulse.trex`
- Repository: `https://github.com/gbuckleyjr/county-pulse-extension`
- Privacy policy: `https://github.com/gbuckleyjr/county-pulse-extension/blob/main/PRIVACY.md`
- Terms: `https://github.com/gbuckleyjr/county-pulse-extension/blob/main/TERMS.md`
- Support: `https://github.com/gbuckleyjr/county-pulse-extension/blob/main/SUPPORT.md`
- Security summary: `https://github.com/gbuckleyjr/county-pulse-extension/blob/main/SECURITY.md`
- Validation matrix: `https://github.com/gbuckleyjr/county-pulse-extension/blob/main/docs/validation.md`
- Exchange assets: `https://github.com/gbuckleyjr/county-pulse-extension/tree/main/docs/exchange`
- Demo materials: `https://github.com/gbuckleyjr/county-pulse-extension/tree/main/demos`

## Security Summary

County Pulse is a static client-side Viz Extension hosted on GitHub Pages. It reads Tableau worksheet summary data through the Tableau Extensions API, renders a bundled county map, and stores only UI preferences in Tableau extension settings or browser local storage during preview. It does not request underlying data permissions, call external APIs at runtime, collect analytics, track users, or store workbook data outside the browser session.

## Submission Checklist

- App hosted over HTTPS.
- `CountyPulse.trex` points at the hosted app URL.
- Manifest name, description, author, version, icon, and custom encodings are present.
- 280x280 transparent PNG icon exists in `docs/exchange/county-pulse-icon-280.png`.
- Exchange screenshots exist in `docs/exchange/`.
- Listing copy exists in `docs/exchange/listing-copy.md`.
- How-it-works notes exist in `docs/exchange/how-it-works.md`.
- Privacy, terms, support, and security docs exist at repo root.
- Demo CSVs are public, non-sensitive county aggregates.
- Validation matrix exists in `docs/validation.md`.

## Submission Blockers

- Tableau has not added this account as an Exchange contributor.
- Tableau Public compatibility is not confirmed.
- Exact Tableau Public rejection or approval message is not captured yet.
- Tableau Desktop local and hosted manifest tests are not recorded yet.
- Final Exchange screenshots should be recaptured from Tableau Desktop/Public after validation.
- Release/versioning policy still needs hardening before a 1.0.0 submission.

## Nice-to-Have Product Work

- More demo workbook scenarios beyond the two public CSVs already added.
- More polished final screenshots after Tableau validation.
- Broader Cloud/Server safelist notes after admin testing.
- Product-copy cleanup and naming pass in issue #11.

## Draft Outreach Email

To: `extensiongallery@tableau.com`

Subject: County Pulse Viz Extension review path for Tableau Exchange and Tableau Public

Hello Tableau Extensions team,

I built County Pulse, a Tableau Viz Extension for animated U.S. county maps driven by Marks card encodings. I would like to understand the review path for Tableau Exchange and whether an Exchange listing is required for Tableau Public compatibility.

Links for review:

- Hosted app: `https://gbuckleyjr.github.io/county-pulse-extension/index.html`
- Manifest: `https://gbuckleyjr.github.io/county-pulse-extension/CountyPulse.trex`
- Repository: `https://github.com/gbuckleyjr/county-pulse-extension`
- Privacy policy: `https://github.com/gbuckleyjr/county-pulse-extension/blob/main/PRIVACY.md`
- Terms: `https://github.com/gbuckleyjr/county-pulse-extension/blob/main/TERMS.md`
- Support: `https://github.com/gbuckleyjr/county-pulse-extension/blob/main/SUPPORT.md`
- Security summary: `https://github.com/gbuckleyjr/county-pulse-extension/blob/main/SECURITY.md`
- Screenshots and listing copy: `https://github.com/gbuckleyjr/county-pulse-extension/tree/main/docs/exchange`

Security summary: County Pulse is a static client-side extension hosted on GitHub Pages. It reads worksheet summary data only through the Tableau Extensions API. It uses bundled JavaScript and county map assets, does not call external APIs at runtime, does not request underlying data permissions, does not collect analytics, and does not store workbook data outside the browser session.

Could you confirm:

1. Can an independent community-built Viz Extension be reviewed for Tableau Exchange?
2. What steps are needed to be added as an Exchange contributor?
3. Is an Exchange listing required for the extension to work on Tableau Public, or is there a separate allowlist/review path?
4. What criteria must a Viz Extension meet to be marked as compatible with Tableau Public?
5. Are there any concerns with GitHub Pages hosting for review, or should the app use another HTTPS host?

Thank you,

Greg Buckley
