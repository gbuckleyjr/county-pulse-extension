# County Pulse Exchange Listing Copy

## Product Name

County Pulse

## Short Tagline

Animated U.S. county pulse maps from Tableau Marks card fields.

## One-Sentence Description

County Pulse turns 5-digit U.S. county FIPS codes and signed measures into animated county-level pulse maps directly inside Tableau worksheets.

## Full Description

County Pulse is a Tableau viz extension for U.S. county-level analysis. It adds a custom worksheet mark type that renders an animated county map from fields mapped on Tableau's Marks card.

Authors provide a 5-digit county FIPS field, a signed numeric measure, and an optional magnitude measure. County Pulse handles the map rendering, color direction, pulse magnitude, and animation modes while Tableau continues to handle the data model, filters, calculations, parameters, dashboard actions, and native tooltip content.

The extension is designed for public-data storytelling and analytical dashboards where positive and negative county-level measures need stronger motion and magnitude cues than a standard static map. Example use cases include migration balances, county population change, economic gains and losses, health-rate differences, housing changes, and other signed county-level metrics.

County Pulse is client-side and uses Tableau worksheet summary data exposed to the extension. It does not request underlying data permissions, send workbook data to external APIs, collect analytics, or store workbook data outside the browser session.

## Key Features

- Tableau worksheet/viz extension configured through custom Marks card encodings.
- U.S. county geometry keyed by 5-digit county FIPS.
- Positive and negative signed values shown with distinct colors.
- Configurable positive, negative, and no-mark colors.
- Optional Magnitude field, with absolute signed value fallback.
- Configurable top-N highlight limit, including an All option.
- Data diagnostics for missing, invalid, unmatched, duplicate, and state-total FIPS rows.
- Static, pulse, rank build, and scanner modes.
- Native Tableau tooltip support where available.
- Client-side static hosting with bundled map and JavaScript assets.

## Suggested Categories

- Maps
- Geospatial
- Public data
- Data storytelling
- Custom visualization

## Primary Audience

Tableau authors who build U.S. county-level dashboards and want an animated signed-measure map without leaving Tableau's worksheet workflow.

## Limitations

- U.S. counties only.
- Requires 5-digit county FIPS.
- Intended for aggregated county-level marks.
- State-total rows such as `01000` should be filtered out.
- Tableau Public compatibility depends on Tableau's extension approval process.

## Support Links

- Extension app: `https://gbuckleyjr.github.io/county-pulse-extension/index.html`
- Manifest: `https://gbuckleyjr.github.io/county-pulse-extension/CountyPulse.trex`
- Repository: `https://github.com/gbuckleyjr/county-pulse-extension`
- Privacy policy: `https://github.com/gbuckleyjr/county-pulse-extension/blob/main/PRIVACY.md`
- Terms: `https://github.com/gbuckleyjr/county-pulse-extension/blob/main/TERMS.md`
- Support: `https://github.com/gbuckleyjr/county-pulse-extension/blob/main/SUPPORT.md`
