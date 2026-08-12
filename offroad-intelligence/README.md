# GRAMMER Offroad Intelligence Hub V16.3

## What changed
V16.3 integrates the existing Daily News pipeline as an additional signal source.

The Daily News process remains separate and independent. The Offroad Intelligence Hub only reads the existing root-level file:

```text
../news-data.json
```

If needed, the app also tries:

```text
./news-data.json
data/news-data.json
```

## New page
A new menu item has been added:

```text
Daily News Signals
```

## Daily News filtering logic
Daily News items are included when:

```text
Auto/CV contains CV
```

and category contains one of:

```text
Construction
Agriculture
Material Handling
Turf
Offroad / Off-highway
```

Automotive-only records are excluded from the Offroad signal layer.

## Intended role
Daily News is not replacing the taxonomy. It is an additional evidence/source layer:

```text
Daily News
  -> Relevant item
  -> Entity / category match
  -> Signal source
  -> Customer, competitor, technology, risk, opportunity views
```

## Files to upload
Replace in `offroad-intelligence/`:

```text
index.html
styles.css
app.js
README.md
```

Keep the existing `data/` folder and keep the root-level `news-data.json` where it is.

## After upload, check
- The portal still loads.
- New menu item `Daily News Signals` appears.
- The page shows relevant CV + Offroad news from root `news-data.json`.
- Use the buttons to switch between all relevant news, customers, competitors only and news & trends.
