# Demo Data

All demo CSVs are public, county-level aggregate data. No private credentials, live connections, or person-level records are required.

## Field Mapping

- `County FIPS`: map to County Pulse `County FIPS`.
- `Signed Value`: map to County Pulse `Signed Value`.
- `Magnitude`: map to County Pulse `Magnitude`.
- `Label`: map to County Pulse `Label`.
- `Tooltip Detail`: add to Tableau Tooltip or Detail.
- `Source`: add to Tableau Tooltip or workbook notes.

## Files

`unemployment-gap-2016.csv`

County unemployment-rate gap versus the 2016 county median of `5.0%`. Positive values are above-median unemployment; negative values are below-median unemployment. Source URL: `https://raw.githubusercontent.com/plotly/datasets/master/laucnty16.csv`

`population-density-gap.csv`

County population-density gap versus the county median of `41` people per square mile. Positive values are denser-than-median counties; negative values are less dense counties. Source URL: `https://raw.githubusercontent.com/balsama/us_counties_data/main/data/counties.csv`
