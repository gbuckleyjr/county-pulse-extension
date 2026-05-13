# County Pulse Extension

Reusable Tableau dashboard extension pattern for animated U.S. county pulse maps. This workbook uses it as **Migration Pulse** for Makeover Monday 2026 Week 19, U.S. county net migration.

## Hosted URL

Open `https://gbuckleyjr.github.io/county-pulse-extension/migration-pulse-extension/index.html`.

Load `MigrationPulse.trex` into Tableau Desktop as a dashboard extension. The manifest points to the same GitHub Pages URL.

## Interaction model

The extension is intentionally trimmed down to one embedded visual pane. Tableau owns filtering through the `Extension Feed` worksheet and dashboard filters. The extension keeps only animation speed, pause/play, source configuration, hover tooltips, and selected-county details.

## Tableau setup

Create a worksheet named `Extension Feed` with one mark per county. Exclude `County = State Total`.

Required fields:

- State
- State FIPS
- County
- County FIPS
- Female Population 2020
- Male Population 2020
- Net Female Migrants
- Net Male Migrants

Useful calculated fields in Tableau:

- `Total Population 2020 = [Female Population 2020] + [Male Population 2020]`
- `Total Net Migrants = [Net Female Migrants] + [Net Male Migrants]`
- `Net Migration Rate per 100 = [Total Net Migrants] / [Total Population 2020] * 100`

The extension can also run outside Tableau by loading `../US County PopMigration.csv` as a preview fallback from the hosted repository.

## Data caveat

The source data is net migration, not origin-destination movement. The pulse animation shows direction and magnitude of decade net balances; it does not show county-to-county migration paths.
