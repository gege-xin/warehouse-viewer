# Warehouse Viewer Handoff

Last updated: 2026-05-11

This document is for continuing work on another computer.

## Project Summary

Warehouse Viewer is a lightweight warehouse rack visualization website for cabinet / sink / building material inventory.

Main goals:

- Public users can open the website, search SKU models, locate warehouse positions, and view location details.
- Admin users can log in and edit warehouse/product data.
- The app is not a full ERP or full WMS. It intentionally avoids inbound/outbound workflows.

Production URL:

- https://solova-950warehouse.vercel.app/

GitHub repo:

- https://github.com/gege-xin/warehouse-viewer.git

Current local branch:

- `main`

## Tech Stack

- React + Vite
- Tailwind CSS
- Firebase Authentication
- Firebase Firestore
- Firestore Security Rules
- dnd-kit for drag interactions
- Vercel deployment

## Admin Accounts

Current admin emails:

```text
cherryliao43@gmail.com
sela21depot@gmail.com
```

Admin emails are configured in:

- `.env`
- `.env.example`
- `src/lib/firebase.js`
- `firestore.rules`

## Firebase Project

Firebase project:

```text
warehous-c9357
```

Current `.env.example` values:

```text
VITE_FIREBASE_API_KEY=AIzaSyD--5lkfyz0mtPP5uBDPbmPru76isKnWQw
VITE_FIREBASE_AUTH_DOMAIN=warehous-c9357.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=warehous-c9357
VITE_FIREBASE_STORAGE_BUCKET=warehous-c9357.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=808240770259
VITE_FIREBASE_APP_ID=1:808240770259:web:bbdb7096b7d9d5445d7826
VITE_FIREBASE_MEASUREMENT_ID=G-R32QCZ2LME
VITE_ADMIN_EMAILS=cherryliao43@gmail.com,sela21depot@gmail.com
```

On a new computer, create `.env` from `.env.example`.

## Current Data Model

The app currently uses Firestore collection:

```text
warehouseLocations
```

This collection stores both warehouse structure and SKU data:

- `type: "zone"` documents contain Zone rows and racks.
- `type: "aisle"` documents contain forklift / main / normal aisle rows.

This was kept intentionally to avoid a risky migration. A `warehouseLayout` rules block has been added for future split-out, but the current app still reads and writes `warehouseLocations`.

Zone shape:

```js
{
  type: 'zone',
  order: 1,
  nameCn: 'A区',
  nameEn: 'Zone A',
  racks: []
}
```

Rack shape:

```js
{
  rackName: 'A1',
  rackNameEn: 'Rack A1',
  columns: 10,
  levels: 3,
  locations: []
}
```

Location shape:

```js
{
  code: 'A-R1-C01-L1',
  location: 'A-R1-C01-L1',
  model: 'SW-B12',
  type: 'door',
  category: 'Base Cabinet',
  cabinetModel: 'B12',
  colorCode: 'SW',
  colorName: 'White',
  qty: 10,
  status: 'occupied',
  note: ''
}
```

Aisle shape:

```js
{
  type: 'aisle',
  aisleType: 'forklift', // forklift | main | normal
  nameCn: '叉车通道',
  nameEn: 'Forklift Aisle',
  heightPx: 64
}
```

## Critical Warehouse Rules

Do not break these rules:

- Aisles are structure, not inventory.
- Aisles cannot be clicked.
- Aisles cannot be searched.
- Aisles cannot receive product drops.
- Aisles do not count as inventory.
- Every rack has max 3 levels.
- Valid levels are only `L1`, `L2`, `L3`.
- Canonical location code format is:

```text
Zone-Rack-Column-Level
```

Example:

```text
A-R1-C01-L1
A-R1-C01-L2
A-R1-C01-L3
```

Avoid old formats like:

```text
A1-04
A1-05
A1-10
```

## Current Features

Public page `/`:

- Warehouse map
- Zone rows
- Rack grid
- Forklift / main / normal aisles
- Search by model, cabinet model, color, status, note, or location code
- Auto locate and highlight
- Large text mode
- Show occupied only
- Mobile horizontal scroll
- Click location detail bottom sheet
- Unassigned warning / staging semantics

Login page `/login`:

- Firebase Auth admin login

Admin page `/admin`:

- Product edit form
- Product drag mode
- Layout edit mode
- Admin search/filter
- Add/delete/edit Zone
- Add/delete/edit Rack
- Add/delete/edit Forklift Aisle / Main Aisle / Normal Aisle
- Drag Zone / Aisle vertically
- Drag Rack within the same Zone
- Mobile fallback move up/down buttons
- Firestore writes include `updatedAt` and `updatedBy`

## Recent Uncommitted Work

As of this handoff, the following changes are present in the working tree:

Modified:

- `firestore.rules`
- `src/App.jsx`
- `src/components/AdminPanel.jsx`
- `src/components/WarehouseMap.jsx`
- `src/lib/warehouseService.js`

New:

- `docs/github-similar-projects-report.md`
- `src/components/AdminLayoutEditor.jsx`
- `src/components/EditableAisle.jsx`
- `src/components/EditableRack.jsx`
- `src/components/EditableZoneRow.jsx`
- `src/components/LayoutSortableItem.jsx`
- `src/hooks/useLayoutEditor.js`
- `HANDOFF.md`

Important: commit and push these changes before switching computers if you want the new machine to receive them from GitHub.

## How To Continue On Another Computer

1. Clone the repo:

```bash
git clone https://github.com/gege-xin/warehouse-viewer.git
cd warehouse-viewer
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env`:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

4. Run locally:

```bash
npm run dev
```

If PowerShell blocks npm scripts:

```powershell
npm.cmd run dev
```

Open:

```text
http://localhost:5173
```

5. Build check:

```bash
npm run build
```

Or on Windows:

```powershell
npm.cmd run build
```

## Firebase Rules Deployment

The local `firestore.rules` file has been updated, but rules must be deployed for production to enforce them.

Deploy rules:

```bash
firebase deploy --only firestore:rules
```

If Firebase CLI is not installed:

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

Security expectation:

- Public users can read.
- Only admin emails can create/update/delete `warehouseLocations`.
- `warehouseLayout` also has admin-only write protection for future use.

## Vercel Deployment

Vercel project URL:

```text
https://solova-950warehouse.vercel.app/
```

To deploy from GitHub:

1. Commit changes.
2. Push to GitHub.
3. Vercel should auto-deploy if connected.

Manual Vercel CLI deploy:

```bash
npm install -g vercel
vercel
vercel --prod
```

Make sure Vercel environment variables match `.env.example`.

## Useful Commands

Run dev server:

```bash
npm.cmd run dev
```

Build:

```bash
npm.cmd run build
```

Generate local seed data:

```bash
npm.cmd run generate:seed
```

Import seed to Firestore:

```bash
npm.cmd run import:seed
```

Migrate old location codes:

```bash
npm.cmd run migrate:codes
```

Check rack levels and bad codes:

```bash
node -e "const data=require('./data/warehouse.json'); const racks=data.filter(x=>x.type==='zone').flatMap(z=>z.racks||[]); console.log(racks.filter(r=>Number(r.levels)!==3).map(r=>r.rackName)); console.log(racks.flatMap(r=>(r.locations||[]).map(l=>l.code)).filter(c=>/-L([4-9]|10)$/i.test(c)));"
```

## Validation Already Done

Latest successful build:

```bash
npm.cmd run build
```

Latest data check result:

```json
{
  "items": 11,
  "racks": 36,
  "badLevels": [],
  "aisles": ["forklift", "forklift", "main", "forklift", "forklift"]
}
```

## Known Notes And Risks

- Some older files still contain mojibake Chinese text from earlier encoding issues. The app builds, but UI copy may need cleanup later.
- README has some outdated sections that mention old `A1-01-01` style codes and 10 levels. Use this handoff as the current source of truth.
- Layout Edit Mode currently writes structure back into `warehouseLocations`; the separate `warehouseLayout` collection is only prepared in Firestore Rules for future use.
- Product Drag Mode and Layout Edit Mode are intentionally separate. Do not combine their drag contexts.
- If deleting a Zone/Rack with products, products are converted to `unassigned` and moved to a generated Staging Area instead of being deleted.
- Firestore rules changes must be deployed separately; changing `firestore.rules` locally does not affect production.

## Recommended Next Steps

1. Commit and push current work.
2. Deploy Firestore Rules.
3. Deploy to Vercel.
4. Test on `/`, `/login`, and `/admin`.
5. Clean up mojibake UI text and outdated README sections.
6. Consider creating a safer layout backup/export before large structure edits.
