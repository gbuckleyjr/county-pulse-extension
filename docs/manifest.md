# Manifest Notes

County Pulse is registered as a Tableau worksheet/viz extension through `CountyPulse.trex`.

## Current Metadata

- Extension ID: `com.gbuckleyjr.countypulse`
- Extension version: `0.2.1`
- Listing name: `County Pulse`
- Author: `Greg Buckley`
- Organization: `Independent`
- Website: `https://github.com/gbuckleyjr/county-pulse-extension`
- Source URL: `https://gbuckleyjr.github.io/county-pulse-extension/index.html`
- Manifest icon source: `assets/icon.png`
- Minimum API version: `1.1`

## Versioning Strategy

County Pulse is still pre-1.0 while it is being prepared for Tableau Exchange review.

- Use patch bumps for documentation, metadata, icon, or small compatibility updates.
- Use minor bumps for user-visible extension behavior changes.
- Reserve `1.0.0` for the first Exchange-ready release candidate after product copy, validation, hosting, and submission assets are complete.
- Do not change the production hosted behavior without a matching manifest version bump.

## API Notes

The extension uses Tableau worksheet content and summary data APIs. It does not request underlying data permissions in the manifest.
