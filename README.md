# County Pulse

County Pulse is a Tableau **viz extension** for animated U.S. county pulse maps. It is installed from a `.trex` file and configured from the worksheet Marks card, not from a dashboard object or a baked-in worksheet feed.

## Hosted Files

- Extension app: `https://gbuckleyjr.github.io/county-pulse-extension/index.html`
- Viz extension manifest: `https://gbuckleyjr.github.io/county-pulse-extension/CountyPulse.trex`
- Exchange assets: [`docs/exchange/`](docs/exchange/)
- Demo materials: [`demos/`](demos/)
- Manifest notes: [`docs/manifest.md`](docs/manifest.md)
- Validation matrix: [`docs/validation.md`](docs/validation.md)
- Submission path: [`docs/submission.md`](docs/submission.md)
- Privacy policy: [`PRIVACY.md`](PRIVACY.md)
- Terms: [`TERMS.md`](TERMS.md)
- Support: [`SUPPORT.md`](SUPPORT.md)
- Security: [`SECURITY.md`](SECURITY.md)

## Tableau Setup

1. Open a worksheet.
2. On the Marks card, choose **Add Extension** under Viz Extensions.
3. Select `CountyPulse.trex`.
4. Map fields to the custom encoding tiles:
   - `County FIPS`: required 5-digit U.S. county FIPS field. Numeric FIPS values are padded when possible.
   - `Signed Value`: required numeric measure. Positive values render teal; negative values render orange.
   - `Pulse Size`: optional numeric measure. If omitted, County Pulse uses absolute Signed Value.
   - `Label`: optional text label for hover, such as county name.
5. Use Tableau filters, parameters, and calculations normally. The extension redraws from the worksheet's summary data.

The built-in Tableau Detail and Tooltip tiles can carry extra fields for hover context.
County Pulse uses Tableau's native tooltip on hover, so tooltip content and formatting should be managed from the worksheet's Tooltip shelf instead of inside the extension.

## Diagnostics

County Pulse reports data diagnostics when worksheet rows cannot be mapped cleanly. The status shows row and matched-county counts, and a diagnostics panel appears for missing FIPS, invalid FIPS, unmatched county geometry, duplicate county rows, missing or invalid signed values, and likely state-total rows such as `01000`. Filter out state-total rows and keep FIPS as 5-digit text when possible.

## Modes

- `Static`: fixed county fills and magnitude marks without motion, useful for production dashboards and screenshots.
- `Pulse`: repeating outward rings for the largest county marks.
- `Rank Build`: reveals marks by signed value. When this mode is selected, a rank-order control appears for `High to low` or `Low to high`.
- `Scanner`: sweeps across the map and lights nearby marks.

## Color Controls

Use the header color controls to set positive, negative, and no-mark colors. Tableau saves those preferences with the extension settings. The same colors update the canvas rendering and legend immediately.

## Highlight Limit

Use the `Highlight` control to choose how many county marks receive animated or static magnitude overlays. The base county map still renders all available county rows; the limit controls the top-N overlay used by `Static`, `Pulse`, `Rank Build`, and `Scanner` modes. Choose `All` for full overlay coverage when performance allows.

## Notes

County Pulse currently supports U.S. county geometry only. The visual expects one summarized mark per county for the cleanest result.

County Pulse reads Tableau worksheet summary data exposed to the extension and uses Tableau extension settings for UI preferences. It does not request underlying data permissions, send workbook data to external APIs, collect analytics, or store workbook data outside the browser session.
