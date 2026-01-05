---
theme: [dashboard]
title: Transfers
---

```js
import * as d3 from "npm:d3";
```

```js
const bootstrapStatic = FileAttachment("data/bootstrapStatic.json").json();
const details = FileAttachment("data/details.json").json();
const squads = FileAttachment("data/squads.json").json();
```

# Transfer Recommendations

```js
// Get all owned player IDs from squads
const ownedPlayerIds = new Set(squads.filter(p => p.owner).map(p => p.id));

// Get all available players from bootstrapStatic (not owned by anyone)
const availablePlayers = bootstrapStatic.elements.filter(p => !ownedPlayerIds.has(p.id));

// Position names
const positionNames = {1: "GK", 2: "DEF", 3: "MID", 4: "FWD"};

// Get all unique managers
const allManagers = [...new Set(details.map(d => d.name))];

// Function to find best replacement by position
function findBestReplacement(player) {
  const replacements = availablePlayers.filter(p => 
    p.element_type === player.element_type && 
    p.id !== player.id &&
    p.total_points > player.total_points &&
    parseFloat(p.form) > parseFloat(player.form)
  );
  
  if (replacements.length === 0) return null;
  
  const best = replacements.sort((a, b) => b.total_points - a.total_points)[0];
  return {
    ...best,
    team_short_name: bootstrapStatic.teams.find(t => t.id === best.team)?.short_name,
    pointsDiff: best.total_points - player.total_points
  };
}

// Get player photo URL from FPL API
function getPlayerPhoto(code) {
  return `https://resources.premierleague.com/premierleague/photos/players/110x140/p${code}.png`;
}

// Calculate best upgrade for each team
const opportunitiesByManager = allManagers.map(manager => {
  const squad = squads.filter(d => d.owner === manager);
  
  const upgrades = squad
    .filter(p => p.position <= 11) // Starting XI only
    .map(player => ({
      player,
      replacement: findBestReplacement(player)
    }))
    .filter(u => u.replacement !== null)
    .sort((a, b) => b.replacement.pointsDiff - a.replacement.pointsDiff)
    .slice(0, 5); // Top 5 upgrades per team
  
  return {manager, upgrades};
});
```

<style>
.manager-section {
  background: var(--theme-background-alt);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.manager-header {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 16px;
  border-bottom: 2px solid var(--theme-foreground-faintest);
  padding-bottom: 8px;
}

.upgrade-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 16px;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background: var(--theme-background);
  border-radius: 6px;
}

.player-box {
  display: flex;
  gap: 12px;
  align-items: center;
}

.player-photo {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 50%;
  background: white;
}

.player-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.player-name {
  font-weight: 600;
}

.player-meta {
  font-size: 0.85rem;
  color: var(--theme-foreground-muted);
}

.arrow {
  font-size: 1.5rem;
  color: var(--theme-green);
  text-align: center;
}

.no-upgrades {
  text-align: center;
  padding: 20px;
  color: var(--theme-foreground-muted);
}
</style>

```js
opportunitiesByManager.forEach(({manager, upgrades}) => {
  display(html`<div class="manager-section">
    <div class="manager-header">${manager}</div>
    ${upgrades.length === 0 ? 
      html`<div class="no-upgrades">No upgrades available</div>` :
      upgrades.map(u => html`<div class="upgrade-row">
        <div class="player-box">
          <img src="${getPlayerPhoto(u.player.code)}" class="player-photo" alt="${u.player.web_name}">
          <div class="player-info">
            <div class="player-name">${u.player.web_name}</div>
            <div class="player-meta">
              ${positionNames[u.player.element_type]} • ${u.player.team_short_name} • ${u.player.total_points} pts • Form: ${u.player.form}
            </div>
          </div>
        </div>
        <div class="arrow">→ +${u.replacement.pointsDiff}</div>
        <div class="player-box">
          <img src="${getPlayerPhoto(u.replacement.code)}" class="player-photo" alt="${u.replacement.web_name}">
          <div class="player-info">
            <div class="player-name">${u.replacement.web_name}</div>
            <div class="player-meta">
              ${positionNames[u.replacement.element_type]} • ${u.replacement.team_short_name} • ${u.replacement.total_points} pts • Form: ${u.replacement.form}
            </div>
          </div>
        </div>
      </div>`)
    }
  </div>`);
});
```
