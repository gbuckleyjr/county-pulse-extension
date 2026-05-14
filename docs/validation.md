# County Pulse Validation Matrix

Status date: 2026-05-14

This file tracks evidence for Tableau review. Local asset checks can be run from this repo; Tableau Desktop, Tableau Public, and Tableau Cloud/Server checks require the actual Tableau runtime.

## Compatibility Summary

| Surface | Status | Notes |
| --- | --- | --- |
| Local static hosting | Pass | `index.html`, `src/county-pulse.js`, and `src/county-pulse.css` returned HTTP 200 from `http://127.0.0.1:8766/`. `node --check src/county-pulse.js` passed. |
| Tableau Desktop local `.trex` | Not run | Needs Tableau Desktop version/build and local `CountyPulse.trex` load test. |
| Tableau Desktop hosted `.trex` | Not run | Needs hosted manifest load from `https://gbuckleyjr.github.io/county-pulse-extension/CountyPulse.trex`. |
| Tableau Public authoring | Not run | Public compatibility status is not confirmed. Current rejection message is not captured in the repo yet. |
| Tableau Public published workbook | Not run | Retest after Tableau confirms Exchange listing or allowlist path. |
| Tableau Cloud/Server | Not run | Requires admin extension settings and safelist access. |

## Environment Results

| Environment | Date | Tableau Version/Build | Result | Evidence | Notes |
| --- | --- | --- | --- | --- | --- |
| Local browser asset smoke | 2026-05-14 | N/A | Pass | HTTP 200 for `index.html`, JS, and CSS; JS syntax check passed. | Confirms hosted files are reachable by a static server, not Tableau runtime behavior. |
| Tableau Desktop local manifest | TBD | TBD | Not run | TBD screenshot/log | Load `CountyPulse.trex` while serving repo locally. |
| Tableau Desktop hosted manifest | TBD | TBD | Not run | TBD screenshot/log | Load GitHub Pages manifest and verify HTTPS app URL. |
| Tableau Public authoring | TBD | TBD | Not run | Paste exact rejection or approval message here. | Try adding/publishing the viz extension from Public after Exchange-facing cleanup. |
| Tableau Public published workbook | TBD | TBD | Not run | TBD public URL | Confirm the published workbook opens for anonymous viewers. |
| Tableau Cloud/Server | TBD | TBD | Not run | TBD admin setting screenshot/log | Confirm Extensions are enabled and `https://gbuckleyjr.github.io` is safelisted. |

## Standard Test Workbook Setup

Use one CSV from [`../demos/data/`](../demos/data/) and one existing migration workbook scenario.

Required field mappings:

- `County FIPS` -> County Pulse `County FIPS`
- `Signed Value` -> County Pulse `Signed Value`
- `Pulse Size` -> County Pulse `Pulse Size`
- `Label` -> County Pulse `Label`
- `Tooltip Detail` -> Tableau Tooltip or Detail
- `Source` -> Tableau Tooltip or workbook notes

Run each visual mode:

- `Static`
- `Pulse`
- `Rank Build` with high-to-low and low-to-high order
- `Scanner`

Run each Highlight setting:

- Top 50
- Top 100
- Top 180
- Top 500
- All

## Known FIPS Test Cases

| Case | Expected Result |
| --- | --- |
| `01001` Autauga County, AL | Draws county fill, pulse/marker, and tooltip. |
| `01003` Baldwin County, AL | Draws separately from `01001`; verifies leading zero preservation. |
| `01005` Barbour County, AL | Draws negative/positive contrast depending on selected scenario. |
| `01000` Alabama state-total style row | Does not draw; diagnostics report state-total row and advise filtering it out. |
| blank FIPS | Does not draw; diagnostics report missing FIPS. |
| `99999` | Does not draw; diagnostics report unmatched county geometry. |
| duplicate `01001` rows | Draws one county row using largest magnitude; diagnostics report duplicate county rows. |
| zero `Pulse Size` | Skips overlay for that row; diagnostics report zero magnitude. |

## Tooltip Validation

1. Add `Tooltip Detail` to Tableau Tooltip or Detail.
2. Hover known counties in Tableau Desktop.
3. Confirm Tableau native tooltip appears when `hoverTupleAsync` is available.
4. Confirm fallback extension tooltip appears if native tooltip is unavailable.
5. Confirm tooltip includes label, signed value, pulse size, and detail fields.

## Screenshot Checklist

Capture or replace these Exchange assets after Tableau runtime validation:

- [`exchange/screenshot-overview.png`](exchange/screenshot-overview.png)
- [`exchange/screenshot-rank-build.png`](exchange/screenshot-rank-build.png)
- [`exchange/screenshot-tooltip.png`](exchange/screenshot-tooltip.png)

Each final screenshot should use public, non-sensitive demo data and show a stable hosted manifest URL.
