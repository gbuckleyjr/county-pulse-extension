# How County Pulse Works

County Pulse is installed from `CountyPulse.trex` as a Tableau worksheet/viz extension. After adding it to a worksheet, authors map fields to custom Marks card encodings.

## Required Fields

`County FIPS`

5-digit U.S. county FIPS code. Numeric FIPS values are padded when possible, but string FIPS fields are recommended so leading zeroes are preserved.

`Signed Value`

Numeric measure that controls direction and color. Positive values render in the positive color; negative values render in the negative color.

## Optional Fields

`Pulse Size`

Numeric measure that controls pulse magnitude. If this field is not supplied, County Pulse uses the absolute value of `Signed Value`.

`Label`

Text field used for extension fallback tooltip labels, usually county name.

## Tableau Tooltip Shelf

County Pulse uses Tableau's native tooltip behavior where available, so authors should put final tooltip content and formatting on the worksheet Tooltip shelf. Fields on Detail can also support richer Tableau hover context.

## Animation Modes

`Pulse`

Repeating outward rings highlight the largest county marks by magnitude.

`Rank Build`

Counties appear in rank order by signed value. The current extension supports high-to-low and low-to-high rank direction.

`Scanner`

A scanning band sweeps across the map and lights nearby county marks.

## Data Handling

County Pulse reads Tableau worksheet summary data exposed through the Extensions API. It does not request underlying data permissions, send workbook data to external APIs, collect analytics, or store workbook data outside the browser session.

## Best Practices

- Use one summarized mark per county.
- Filter out state-total rows such as `01000`.
- Use a signed measure when positive and negative direction matters.
- Use `Pulse Size` when magnitude differs from absolute signed value.
- Keep tooltip definitions in Tableau for consistent dashboard behavior.
