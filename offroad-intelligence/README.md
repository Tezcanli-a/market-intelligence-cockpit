# GRAMMER Offroad Intelligence Hub V16

## V16 focus
Valona-inspired modules adapted for GRAMMER Offroad:
- Research Center
- Visual Analysis
- Customer-Competitor Matrix
- Risk-Opportunity Heatmap
- Competitor and customer key figures
- Quarterly profile update logic

## Required upload structure
Upload into `offroad-intelligence/`:
- index.html
- styles.css
- app.js
- README.md
- data/

Inside `offroad-intelligence/data/`:
- meta.json
- research.json
- signals.json
- competitors.json
- customers.json
- technologies.json
- opportunities.json
- risks.json
- weekly.json
- keyfigures.json

## Key architecture rule
Signals remain the central intelligence object. Customer, competitor and technology profiles are linked through IDs.

## Quarterly profile update logic
Customer and competitor key figures should be refreshed quarterly when public online sources publish updated facts, annual reports, investor presentations, company factsheets or website updates.

## Populated real-object seed data
This version contains first real-object seed data for:
- Isringhausen
- Sears Seating
- John Deere / Deere & Company
- KION Group

Only figures found in checked public sources are populated. Unknown values remain marked as not publicly confirmed or not populated.
