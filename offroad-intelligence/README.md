## GRAMMER Offroad Intelligence Hub V16.5.2

### What changed

V16.5.2 removes the duplicate `Key Figures` navigation concept and introduces a separate `Performance Monitor`.

### Logic

- Current key figures stay embedded in Customer Profiles and Competitor Profiles.
- The new Performance Monitor is reserved for visual year-over-year and historical trend development.
- The page reads `data/performance_trends.json`.
- If only one year is available, the page shows the current value and states that previous-year data is needed for YoY calculation.

### Files to replace

Replace in `offroad-intelligence/`:

- `index.html`
- `app.js`
- `README.md`

Add in `offroad-intelligence/data/`:

- `performance_trends.json`

Do not delete existing customer, competitor, benchmarking, signal, risk or opportunity JSON files.
