# County Pulse Demo Materials

These demo materials are inputs for reusable Tableau workbooks. They are separate from the core extension app and can be replaced without changing `CountyPulse.trex` or the hosted extension.

## Scenarios

`Migration Pulse`

The original Makeover Monday migration workbook remains the first demo scenario. It proves the core signed-measure pattern: positive and negative county values, magnitude cues, Tableau filters, and native tooltip content.

`Unemployment Gap 2016`

Data file: [`data/unemployment-gap-2016.csv`](data/unemployment-gap-2016.csv)

Public source: BLS Local Area Unemployment Statistics 2016, using Plotly's public `laucnty16.csv` sample file: `https://raw.githubusercontent.com/plotly/datasets/master/laucnty16.csv`

`Signed Value` is county unemployment rate minus the national county median in percentage points. Positive values mean higher unemployment than the county median; negative values mean lower unemployment.

`Population Density Gap`

Data file: [`data/population-density-gap.csv`](data/population-density-gap.csv)

Public source: public county population and density dataset from `balsama/us_counties_data`: `https://raw.githubusercontent.com/balsama/us_counties_data/main/data/counties.csv`

`Signed Value` is county population density minus the national county median. Positive values mean denser-than-median counties; negative values mean less dense counties.

## Tableau Build Steps

1. Connect Tableau Desktop to one CSV under `demos/data/`.
2. Set `County FIPS` to string so leading zeroes stay intact.
3. Add `CountyPulse.trex` as a Viz Extension on a worksheet.
4. Map `County FIPS`, `Signed Value`, `Pulse Size`, and `Label` to the custom Marks card encodings.
5. Add `Tooltip Detail` and `Source` to Tooltip or Detail.
6. Use `Static` for screenshots, then `Pulse`, `Rank Build`, or `Scanner` for interactive demos.

## Screenshot Notes

Draft Exchange screenshots live in [`../docs/exchange/`](../docs/exchange/). They use public, non-sensitive county-level sample values. Final review screenshots should be recaptured from Tableau Desktop or Tableau Public during the validation pass in issue #9.
