# AGENTS.md

## Purpose

This folder contains the `County Pulse` Tableau dashboard extension, currently configured as `Migration Pulse` for the 2026.05.11 Makeover Monday dataset.

## Files

- `MigrationPulse.trex`: Tableau dashboard extension manifest. Source URL points to `https://gbuckleyjr.github.io/county-pulse-extension/migration-pulse-extension/index.html`.
- `index.html`: Extension shell and controls.
- `src/migration-pulse.js`: Tableau initialization, local CSV fallback, D3/Canvas map rendering, pulse animation, and tooltip behavior.
- `src/migration-pulse.css`: Extension layout and visual styling.
- `assets/tableau.extensions.1.latest.js`: Tableau Extensions API library copied from shared reference materials.
- `assets/d3.v7.min.js`, `assets/topojson-client.min.js`, `assets/counties-10m.json`: Local visualization dependencies.

## Implementation notes

- This is a dashboard extension, not a worksheet/viz extension.
- It reads summary data from a worksheet named `Extension Feed` when running in Tableau.
- It falls back to `../US County PopMigration.csv` when previewed in a normal browser.
- County geometry is keyed by 5-character FIPS. Keep leading zeros intact in Tableau.
- The animation intentionally avoids origin-destination paths because the dataset only contains net migration balances.
- Dashboard filters should live in Tableau and affect the `Extension Feed` worksheet. The extension no longer exposes state, metric, mode, or Top N dropdowns.
- The embedded view uses a fixed pulse mode, ranks by absolute net migrants, and highlights the top 250 counties in the current worksheet result.
- `Gender split` mode was removed on 2026-05-12 because it was visually broken.
- Pause behavior was fixed on 2026-05-12: it now freezes accumulated animation time instead of resetting to frame zero.

## Testing

Open the GitHub Pages URL above. In Tableau Desktop, add the dashboard extension through `MigrationPulse.trex`.

Full Tableau runtime validation still requires Tableau Desktop.
