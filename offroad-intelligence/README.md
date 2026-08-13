## GRAMMER Offroad Intelligence Hub V16.5.1

### What changed

V16.5.1 keeps the frozen V16.5 structure and restores rich page rendering.

### Main fixes

- Intelligence Overview now uses fallback-safe rendering for signals, assessments, opportunities and risks.
- Customer Profiles use Level 1, Level 2 and Level 3 fields again when available.
- Competitor Profiles use permanent facts, quarterly facts, strengths, weaknesses, questions and GRAMMER counter-message again when available.
- Benchmarking shows benchmark dimensions again instead of only benchmark titles.
- Technology Intelligence keeps existing radar fields and adds a visible V16.5 investment lens.
- Signal Register keeps Confidence, Evidence, Business implication and Assessment.

### Files to replace

Replace in `offroad-intelligence/`:

- `index.html`
- `app.js`
- `README.md`

Do not replace `styles.css` unless you want to change the design.
