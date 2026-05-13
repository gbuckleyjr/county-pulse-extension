# County Pulse

County Pulse is a Tableau **viz extension** for animated U.S. county pulse maps. It is installed from a `.trex` file and configured from the worksheet Marks card, not from a dashboard object or a baked-in worksheet feed.

## Hosted Files

- Extension app: `https://gbuckleyjr.github.io/county-pulse-extension/index.html`
- Viz extension manifest: `https://gbuckleyjr.github.io/county-pulse-extension/CountyPulse.trex`

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

## Modes

- `Pulse`: repeating outward rings for the largest county marks.
- `Rank Build`: reveals marks by signed value. When this mode is selected, a rank-order control appears for `High to low` or `Low to high`.
- `Scanner`: sweeps across the map and lights nearby marks.

## Notes

County Pulse currently supports U.S. county geometry only. The visual expects one summarized mark per county for the cleanest result.
