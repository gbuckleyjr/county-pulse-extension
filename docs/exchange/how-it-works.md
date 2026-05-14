# How County Pulse Works

County Pulse is installed from `CountyPulse.trex` as a Tableau worksheet/viz extension. After adding it to a worksheet, authors map fields to custom Marks card encodings.

## Required Fields

`County FIPS`

5-digit U.S. county FIPS code. Numeric FIPS values are padded when possible, but string FIPS fields are recommended so leading zeroes are preserved.

`Signed Value`

Numeric measure that controls direction and color. Positive values render in the positive color; negative values render in the negative color.

## Optional Fields

`Magnitude`

Numeric measure that controls pulse magnitude. If this field is not supplied, County Pulse uses the absolute value of `Signed Value`.

`Label`

Text field used for extension fallback tooltip labels, usually county name.

## Data Diagnostics

County Pulse validates worksheet rows before drawing. It reports matched counties, rows without matching county geometry, duplicate county rows, missing FIPS, missing or invalid signed values, zero-magnitude rows, and likely state-total FIPS such as `01000`.

Use 5-digit county FIPS values such as `01001`. Numeric FIPS values are padded when possible, but text fields are safer because leading zeroes are preserved. Filter out state-total rows ending in `000` before mapping county data.

## Tableau Tooltip Shelf

County Pulse uses Tableau's native tooltip behavior where available, so authors should put final tooltip content and formatting on the worksheet Tooltip shelf. Fields on Detail can also support richer Tableau hover context.

## Animation Modes

`Static`

Fixed county fills and magnitude marks without motion. Use this mode for production dashboards, screenshots, and reduced-motion contexts.

`Pulse`

Repeating outward rings highlight the largest county marks by magnitude.

`Rank Build`

Counties appear in rank order by signed value. The current extension supports high-to-low and low-to-high rank direction.

`Scanner`

A scanning band sweeps across the map and lights nearby county marks.

## Data Handling

County Pulse reads Tableau worksheet summary data exposed through the Extensions API. It does not request underlying data permissions, send workbook data to external APIs, collect analytics, or store workbook data outside the browser session.

## Color Controls

Authors can set positive, negative, and no-mark colors from the extension header. Color changes update the canvas and legend immediately, and Tableau stores the selected colors with the extension settings.

## Highlight Limit

The `Highlight` control sets the number of county marks used for animated or static magnitude overlays. The base county map still colors all available rows. Use Top 50, Top 100, Top 180, Top 500, or All depending on story needs and performance.

## Best Practices

- Use one summarized mark per county.
- Filter out state-total rows such as `01000`.
- Use a signed measure when positive and negative direction matters.
- Use `Magnitude` when magnitude differs from absolute signed value.
- Adjust positive, negative, and no-mark colors to match the dashboard palette.
- Use a lower Highlight limit for focused stories or dense dashboards.
- Keep tooltip definitions in Tableau for consistent dashboard behavior.
