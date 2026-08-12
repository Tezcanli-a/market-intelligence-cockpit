# GRAMMER Offroad Intelligence Hub V16.4

## Purpose
V16.4 makes the difference between **Intelligence Overview** and **Daily News Signals** clearer.

Daily News remains a separate automated source pipeline. This portal reads the existing `news-data.json` and classifies relevant CV / Offroad news into:

- Entity Type: Customer, Competitor, News & Trends
- Industry: Construction, Agriculture, Material Handling, Turf, Offroad
- Signal Type: Autonomy / AI, Investment / Footprint, Partnership / M&A, Financial / Market, Product / Launch, Electrification, Sustainability / Materials, Market / Competition
- Technology / trend tags

## What changed vs V16.3
- Intelligence Overview now shows strategic signal clusters, not raw news cards.
- New Signal Radar page groups Daily News by technology and trend themes.
- Daily News Signals remains the article-level source table.
- The Daily News table now shows detected technology / trend tags and signal type.
- New filters: Industry, Signal Type, Entity Type, Search.

## Files to replace
Replace in `offroad-intelligence/`:

- `index.html`
- `styles.css`
- `app.js`
- `README.md`

Keep your existing `data/` folder and keep root-level `news-data.json` where it is.

## Check after upload
1. Intelligence Overview should show grouped clusters, not only the first news items.
2. Signal Radar should show mapped technology/trend themes.
3. Daily News Signals should show the full source table.
4. Filters should work across overview and Daily News.
