## GRAMMER Offroad Intelligence Hub V16.4.1

### What changed

V16.4.1 separates the portal into three intelligence layers:

1. Daily News Signals = Evidence Layer / What happened
2. Signal Register = Signal Layer / Why it matters
3. Intelligence Assessments = Analyst Layer / What GRAMMER should do

### Main fixes

- Intelligence Overview no longer duplicates the full Daily News page.
- Intelligence Overview now shows curated assessments, opportunities, risks and only a few evidence highlights.
- Daily News Signals remains the raw source/evidence page.
- Signal Register now uses Business implication instead of Why it matters.
- Signal Register includes Confidence and Evidence columns.
- Intelligence Assessments now uses a three-layer card structure: Evidence, Interpretation, Action/Forecast.
- If assessments.json is missing or empty, the app creates fallback assessment cards from the first signals to avoid a blank page.

### Files to replace

Replace in `offroad-intelligence/`:

- `index.html`
- `app.js`
- `README.md`

Add or keep in `offroad-intelligence/data/`:

- `evidence.json`
- `assessments.json`
