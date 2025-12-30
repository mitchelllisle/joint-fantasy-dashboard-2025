# Fantasy Draft Dashboard

A comprehensive Fantasy Premier League Draft dashboard built with [Observable Framework](https://observablehq.com/framework/).

## Features

- **Overview**: Quick stats, current gameweek info, and top players
- **League Standings**: Track your draft league's performance with win/loss records
- **Player Statistics**: Detailed player stats with interactive filters and efficiency metrics
- **Team Comparison**: Compare Premier League teams and their performance

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn

### Installation

```bash
npm install
```

### Configuration

To track your draft league, add your league ID to `src/data/managers.json.ts`:

```typescript
const DRAFT_LEAGUE_ID = 12345;  // Replace with your draft league ID
```

You can find your league ID in the URL: `https://fantasy.premierleague.com/draft/league/12345`

### Development

Start the development server:

```bash
npm run dev
```

The dashboard will be available at http://localhost:3000

### Build

Build the static site:

```bash
npm run build
```

The built site will be in the `dist` directory.

## Data Sources

All data is fetched from the official Fantasy Premier League API:

- **Bootstrap Static**: Teams, players, gameweeks, positions
- **Draft League Details**: League info, standings, and team records
- **Live Data**: Real-time gameweek performance

Data is refreshed each time the page loads.

## Draft vs Regular FPL

This dashboard is designed for **Fantasy Draft** leagues, which differ from regular FPL:

- ✅ No player prices or budgets
- ✅ Players are drafted, not bought
- ✅ Head-to-head matches with win/loss records
- ✅ Waiver system for player acquisitions
- ✅ League-specific player ownership

## Tech Stack

- [Observable Framework](https://observablehq.com/framework/) - Static site generator for data apps
- [Observable Plot](https://observablehq.com/plot/) - Data visualization library
- TypeScript - Type-safe data loaders
- FPL API - Official Fantasy Premier League data

## Project Structure

```
joint-fantasy/
├── src/
│   ├── data/               # Data loaders (TypeScript)
│   │   ├── bootstrap.json.ts
│   │   ├── managers.json.ts
│   │   └── live.json.ts
│   ├── types/              # TypeScript type definitions
│   │   └── fpl.ts
│   ├── index.md            # Homepage
│   ├── league.md           # League standings
│   ├── players.md          # Player statistics
│   └── teams.md            # Team comparison
├── observablehq.config.ts  # Framework configuration
└── package.json
```

## License

MIT
