# Fantasy Draft Dashboard

## Project Overview
Observable Framework project for a Fantasy Draft dashboard that displays league standings, team comparisons, and player statistics.

**Important:** This is for Fantasy Draft mode, not regular Fantasy Premier League.

## Tech Stack
- Observable Framework
- TypeScript
- Data Loaders for FPL Draft API integration
- Observable Plot for visualizations
- **joint-fpl-lib** - Published npm package for reusable utilities

## Library
The project uses `joint-fpl-lib` (published on npm) for shared code:
- **Utilities**: Color palette, Gini coefficient, no-data helpers
- **Charts**: All visualization components (bumpChart, pointsPerWeek, etc.)

Install with:
```bash
yarn add joint-fpl-lib
```

Import utilities:
```javascript
import {colours} from "joint-fpl-lib/utils/colours";
import {noDataTextMark} from "joint-fpl-lib/utils/noDataTextMark";
```

Import charts:
```javascript
import {bumpChart} from "joint-fpl-lib/charts/bumpChart";
import {pointsPerWeek} from "joint-fpl-lib/charts/pointsPerWeek";
```

View on npm: https://www.npmjs.com/package/joint-fpl-lib

## Project Status
- [x] Created copilot-instructions.md file
- [x] Initialize Observable Framework project
- [x] Create data loaders for FPL Draft API
- [x] Create dashboard pages
- [x] Install dependencies and run dev server
- [x] Updated for Draft mode (removed prices, added draft standings)
- [x] Published reusable library to npm

## Project Structure
- `src/` - Source files
  - `data/` - Data loaders (TypeScript) that fetch from FPL Draft API
  - `types/` - TypeScript type definitions
  - `index.md`, `league.md`, `players.md`, `teams.md` - Dashboard pages
- `observablehq.config.ts` - Framework configuration
- `package.json` - Dependencies and scripts

**Note**: All chart components are imported from `joint-fpl-lib` npm package.

## Configuration
To track your draft league, add your league ID to `src/data/managers.json.ts`:
```typescript
const DRAFT_LEAGUE_ID = 12345; // Your Draft League ID
```

Find it in the URL: `fantasy.premierleague.com/draft/league/YOUR_LEAGUE_ID`

## Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run clean` - Clean cache and dist
