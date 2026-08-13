# V16.5.3 Visual Analysis Patch

## Purpose
This patch upgrades the two weak visual analysis pages:

1. Customer-Competitor Matrix -> Account Prioritization Heatmap
2. Risk-Opportunity Heatmap -> Impact x Probability Matrix

## Files
- `V16_5_3_visual_patch.js`
- `V16_5_3_visual_patch.css`

## How to apply

### app.js
Open `offroad-intelligence/app.js` and replace the existing functions:

- `renderMatrix()`
- `renderHeatmap()`

with the versions in `V16_5_3_visual_patch.js`.

Also copy the helper functions in the JS patch above those two render functions.

### styles.css
Append the full content of `V16_5_3_visual_patch.css` to the bottom of `offroad-intelligence/styles.css`.

## Result
The Customer-Competitor Matrix becomes a visual account prioritization page:
- P1 / P2 / P3 priority labels
- Opportunity score
- Competitor pressure score
- Technology change score
- Color-coded competitor exposure

The Risk-Opportunity page becomes a real heatmap:
- Act now
- Watch closely
- Execute selectively
- Monitor
- Green opportunity bubbles
- Red risk bubbles
