# GRAMMER Offroad Intelligence Hub V15.3

## V15.3 theme
Entity Relationship Model.

This version links intelligence signals to:
- competitors
- customers
- technologies
- opportunities
- risks

## Main UI changes
- Added Entity Relationships view.
- Customer Map became Customer Profiles with expandable customer details.
- Competitor profiles now show related signals and related customers based on IDs.
- Signal register now shows linked entities.
- KPI area now includes linked entities.

## Required structure
Upload into `offroad-intelligence/`:
- index.html
- styles.css
- app.js
- README.md
- data/

Inside `offroad-intelligence/data/`:
- meta.json
- signals.json
- competitors.json
- customers.json
- technologies.json
- opportunities.json
- risks.json
- weekly.json

## Key architecture rule
Signals are the central object.
Each signal can include:
- competitorIds
- customerIds
- technologyIds
- opportunityIds
- riskIds

This is the foundation for future agent-generated intelligence.
