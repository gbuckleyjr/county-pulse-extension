# Privacy Policy

County Pulse is a client-side Tableau viz extension for U.S. county-level maps.

## Data Access

County Pulse reads the worksheet summary data exposed to the extension through Tableau's Extensions API. It uses the fields mapped on the Marks card, including:

- `County FIPS`
- `Signed Value`
- `Pulse Size`
- `Label`
- fields available to Tableau tooltip/detail behavior

County Pulse does not request underlying data tables and does not require full-data permissions in the `.trex` manifest.

## Data Use

County Pulse uses worksheet summary data only to render the map, animate county marks, and show tooltip context in the browser session.

The extension does not:

- send workbook data to external APIs
- collect analytics or tracking events
- set cookies
- persist workbook data outside the browser session
- sell or share workbook data

## Settings Storage

When County Pulse runs inside Tableau, it stores UI preferences with Tableau extension settings. Current stored preferences are animation mode and rank-build order.

When opened outside Tableau for preview, the extension may use browser `localStorage` for the same UI preferences. These preview settings do not contain workbook data.

## Network Requests

County Pulse is loaded from its hosted static files. The app fetches its bundled county topology file from `assets/counties-10m.json` and loads local JavaScript/CSS assets from the same hosted project.

The app code does not transmit Tableau workbook data to the hosting provider. The hosting provider may receive standard web server request metadata, such as IP address, browser user agent, referrer, requested URL, and timestamps, when serving static files.

## Supported Data Shape

County Pulse is designed for aggregated U.S. county-level rows. It expects a 5-digit county FIPS field and one summarized mark per county for the cleanest result.

Known limitations:

- U.S. counties only
- 5-digit county FIPS required
- state-total rows such as `01000` should be filtered out
- not designed for record-level personal data

## Contact

For privacy questions, open an issue in the County Pulse GitHub repository:

`https://github.com/gbuckleyjr/county-pulse-extension/issues`
