# Support

Use GitHub issues for County Pulse support:

`https://github.com/gbuckleyjr/county-pulse-extension/issues`

## Before Opening an Issue

Include:

- Tableau product and version, such as Desktop, Public, Cloud, or Server
- whether you loaded the local `.trex` or hosted `.trex`
- browser and operating system if relevant
- field mappings for `County FIPS`, `Signed Value`, `Pulse Size`, and `Label`
- whether the issue happens with the sample workbook or only with your data
- screenshots or error text when safe to share

Do not include confidential workbook data, credentials, tokens, or private URLs in public issues.

## Supported Use

County Pulse is intended for:

- Tableau worksheet/viz extension use
- U.S. county-level data
- 5-digit county FIPS geography
- aggregated marks, ideally one mark per county
- signed numeric measures where positive and negative values should be visually distinct

## Known Limitations

- U.S. counties only
- 5-digit county FIPS required
- state-total rows such as `01000` should be filtered out
- very large or duplicated mark sets may need aggregation or filtering
- Tableau Public support requires Tableau approval and may not work for arbitrary self-hosted extensions

## Troubleshooting

If no counties render:

1. Confirm `County FIPS` is mapped on the Marks card.
2. Confirm `Signed Value` is mapped and numeric.
3. Confirm FIPS values are county codes, not state-total rows.
4. Confirm the worksheet has visible marks after filters.
5. Check whether Tableau blocked the extension host or manifest.

If tooltips look wrong:

1. Confirm the worksheet Tooltip shelf contains the expected fields.
2. Test a known county and compare Tableau's mark tooltip to County Pulse hover behavior.
3. Include the affected FIPS value and expected tooltip fields in the issue.

## Security Reports

For security-sensitive reports, do not post exploit details, credentials, or private data in a public issue. Open a GitHub issue with the title `Security report request` and a minimal description so the maintainer can arrange private follow-up.
