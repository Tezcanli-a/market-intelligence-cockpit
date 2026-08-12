# GRAMMER Offroad Intelligence Hub V16.2

## What changed
V16.2 integrates Profile Pack V1 directly into the portal.

The portal now loads and renders:
- `data/customer_profiles.json`
- `data/competitor_profiles.json`
- `data/benchmarking.json`

## New/updated pages
- Customer Profiles now render the 3-level customer profile model.
- Competitor Profiles now render the 3-level competitor profile model.
- Benchmarking is now a visible menu item using `benchmarking.json`.
- Key Figures are generated from the profile pack and shown separately.

## Upload structure
Upload/replace in `offroad-intelligence/`:
- `index.html`
- `styles.css`
- `app.js`
- `README.md`
- `data/`

Inside `offroad-intelligence/data/`, make sure these files exist:
- `customer_profiles.json`
- `competitor_profiles.json`
- `benchmarking.json`
- plus the existing V16 JSON files.

## Check after upload
- Customer Profiles should show John Deere, CNH, AGCO, Caterpillar, KION, Jungheinrich and Toyota Material Handling.
- Competitor Profiles should show Isringhausen, Sears Seating, KAB Seating and Milsco.
- Benchmarking should show GRAMMER vs Isringhausen, GRAMMER vs Sears Seating, and John Deere Supplier Landscape.
