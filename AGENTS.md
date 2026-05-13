# AGENTS.md

## Project

Makeover Monday 2026 Week 19, folder `2026.05.11`.

Dataset: `US County PopMigration.csv`

Topic: U.S. county net migration, 2010-2020. Data source summary lives in `Data Source Summary.txt`.

## Tableau Extension

Extension folder: `migration-pulse-extension`

Manifest: `migration-pulse-extension\MigrationPulse.trex`

Hosted URL: `https://gbuckleyjr.github.io/county-pulse-extension/migration-pulse-extension/index.html`

Run local server from repo root:

```powershell
py -m http.server 8765
```

Current extension type: Tableau dashboard extension, not viz extension. Add it from dashboard `Objects > Extension > My Extensions`. Do not load it from worksheet Marks card.

## Current Behavior

- Extension can load directly from the local CSV fallback, so it may render without selecting a worksheet.
- Proper Tableau-connected mode still works by selecting a worksheet feed from the `Data` button.
- Animation modes now available: `Pulse`, `Rank build`, `Scanner`.
- `Gender split` mode removed because it was broken.
- Pause now freezes the current animation state instead of snapping back to frame zero.

## Tableau Setup

To make extension react to Tableau filters:

1. Create worksheet named `Extension Feed`.
2. Put one county per mark.
3. Exclude `County = State Total`.
4. Add these fields to Detail:
   - `State`
   - `State FIPS`
   - `County`
   - `County FIPS`
   - `Female Population 2020`
   - `Male Population 2020`
   - `Net Female Migrants`
   - `Net Male Migrants`
5. Put `Extension Feed` on the dashboard, or keep it available for the dashboard extension.
6. Add `MigrationPulse.trex` as dashboard extension.
7. Click extension `Data`, select `Extension Feed`, click `Use worksheet`.

If no worksheet is selected, local CSV fallback still renders the map but will not respond to Tableau filters.

## Key Files

- `Dashboard Extension Plan.txt`: planning notes and status.
- `Data Source Summary.txt`: source-specific data notes and caveats.
- `migration-pulse-extension\src\migration-pulse.js`: app logic.
- `migration-pulse-extension\src\migration-pulse.css`: styling.
- `migration-pulse-extension\index.html`: controls and shell.
- `migration-pulse-extension\assets\counties-10m.json`: county geometry.

## Caveat

The data contains net migration balances only. Do not animate county-to-county paths. Pulses show direction and magnitude of net gain/loss over the decade.

## Next Good Work

- Test inside Tableau Desktop after creating `Extension Feed`.
- Add state zoom: when user selects a state, fit/zoom map to that state's counties instead of keeping full U.S. extent.
- Decide whether to keep CSV fallback in final version or require worksheet mode.
- Publish to GitHub Pages when ready, then update `.trex` URL to hosted HTTPS path.
- Tune colors/labels after seeing it in actual dashboard layout.
