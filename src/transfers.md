---
theme: [dashboard]
title: Transfers
toc: false
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
const managerOptions = [...new Set(details.map(d => d.name))];
const selectedManager = view(Inputs.select(
  managerOptions,
  {label: "Select Manager", value: managerOptions[0]}
));
```

```js
// Get all owned player IDs from squads
const ownedPlayerIds = new Set(squads.filter(p => p.owner).map(p => p.id));

// Get all available players from bootstrapStatic (not owned by anyone and available for transfer)
const availablePlayers = bootstrapStatic.elements.filter(p => 
  !ownedPlayerIds.has(p.id) && 
  p.status === 'a' && // Only available players (not injured, suspended, or unavailable)
  p.minutes > 90 // Must have played at least 90 minutes (more than 1 game)
);

// Position names
const positionNames = {1: "GK", 2: "DEF", 3: "MID", 4: "FWD"};

// Calculate a composite score for recommendation quality
function calculateScore(player) {
  const ppg = parseFloat(player.points_per_game) || 0;
  const form = parseFloat(player.form) || 0;
  const ictIndex = parseFloat(player.ict_index) || 0;
  const minutes = player.minutes || 0;
  
  // Weight: PPG (50%), Form (30%), ICT (10%), Minutes (10%)
  return (ppg * 0.5) + (form * 0.3) + (ictIndex / 100 * 0.1) + (minutes / 1000 * 0.1);
}

// Function to find best replacement by position
function findBestReplacement(player) {
  const currentPPG = parseFloat(player.points_per_game) || 0;
  const currentForm = parseFloat(player.form) || 0;
  const currentScore = calculateScore(player);
  
  const replacements = availablePlayers.filter(p => 
    p.element_type === player.element_type && 
    p.id !== player.id &&
    calculateScore(p) > currentScore // Must have better overall score
  );
  
  if (replacements.length === 0) return null;
  
  // Sort by composite score
  const best = replacements.sort((a, b) => calculateScore(b) - calculateScore(a))[0];
  
  return {
    ...best,
    team_short_name: bootstrapStatic.teams.find(t => t.id === best.team)?.short_name,
    pointsDiff: best.total_points - player.total_points,
    ppgDiff: (parseFloat(best.points_per_game) - currentPPG).toFixed(1),
    formDiff: (parseFloat(best.form) - currentForm).toFixed(1),
    score: calculateScore(best),
    currentScore: currentScore
  };
}

// Get player photo URL from FPL API
function getPlayerPhoto(code) {
  return `https://resources.premierleague.com/premierleague/photos/players/110x140/p${code}.png`;
}

// Calculate upgrades for selected manager's entire squad
const mySquad = squads.filter(d => d.owner === selectedManager);
const allUpgrades = mySquad
  .map(player => ({
    player,
    replacement: findBestReplacement(player),
    isStarting: player.position <= 11
  }))
  .filter(u => u.replacement !== null); // Only keep upgradeable players

// Group by replacement player (so we can show which of my players can be replaced by the same target)
const groupedByReplacement = new Map();
allUpgrades.forEach(upgrade => {
  const replacementId = upgrade.replacement.id;
  if (!groupedByReplacement.has(replacementId)) {
    groupedByReplacement.set(replacementId, {
      replacement: upgrade.replacement,
      canReplace: []
    });
  }
  groupedByReplacement.get(replacementId).canReplace.push(upgrade.player);
});

// Convert to array and sort by total PPG gain (replacement PPG * number of players they can replace)
const groupedUpgrades = Array.from(groupedByReplacement.values())
  .map(group => ({
    ...group,
    totalImpact: group.canReplace.reduce((sum, p) => 
      sum + (parseFloat(group.replacement.points_per_game) - parseFloat(p.points_per_game)), 0
    ),
    startingPlayers: group.canReplace.filter(p => p.position <= 11),
    benchPlayers: group.canReplace.filter(p => p.position > 11)
  }))
  .sort((a, b) => b.totalImpact - a.totalImpact);

// Calculate summary stats
const upgradeableCount = mySquad.filter(p => allUpgrades.some(u => u.player.id === p.id)).length;
const totalPPGGain = allUpgrades
  .filter(u => u.isStarting)
  .reduce((sum, u) => sum + parseFloat(u.replacement.ppgDiff), 0);
const bestUpgrade = groupedUpgrades.length > 0 ? groupedUpgrades[0] : null;
```

<div class="grid grid-cols-3">
  <div class="card">
    <h2>Upgradeable Players</h2>
    <span class="big" style="background: linear-gradient(135deg, var(--theme-green) 0%, var(--theme-foreground-focus) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">${upgradeableCount}</span>
  </div>
  <div class="card">
    <h2>Starting XI Impact</h2>
    <span class="big" style="background: linear-gradient(135deg, var(--theme-green) 0%, var(--theme-foreground-focus) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">+${totalPPGGain.toFixed(1)}</span> <span style="font-size: 1.2rem; color: var(--theme-foreground-muted);">PPG</span>
  </div>
  <div class="card">
    <h2>Top Target</h2>
    ${bestUpgrade ? html`<span class="big" style="font-size: 1.5rem; background: linear-gradient(135deg, var(--theme-green) 0%, #9333ea 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">${bestUpgrade.replacement.web_name}</span>` : html`<span class="muted">Squad optimized</span>`}
  </div>
</div>

```js
html`<div class="grid grid-cols-3">
  ${groupedUpgrades.length === 0 
    ? html`<div class="card grid-colspan-3">
        <p style="text-align: center; padding: 2rem; color: var(--theme-foreground-muted);">
          ✨ Your squad is optimized! No better available players found.
        </p>
      </div>`
    : groupedUpgrades.map(group => {
        const avgPPGGain = group.totalImpact / group.canReplace.length;
        
        return html`<div class="card">
          <h2>${group.replacement.web_name}</h2>
          <h3>${positionNames[group.replacement.element_type]} • ${group.replacement.team_short_name} • <span style="color: var(--theme-green); font-weight: 700;">+${avgPPGGain.toFixed(1)} PPG</span></h3>
          <div style="display: flex; gap: 1rem; align-items: flex-start; margin-top: 1.5rem;">
            <img src="${getPlayerPhoto(group.replacement.code)}" style="width: 80px; height: 80px; border-radius: 50%; background: white; border: 3px solid var(--theme-green); flex-shrink: 0;" alt="${group.replacement.web_name}">
            <div style="flex: 1;">
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; margin-bottom: 1.25rem; padding: 0.75rem; background: var(--theme-background); border-radius: 0.5rem;">
                <div>
                  <div style="font-size: 0.7rem; color: var(--theme-foreground-muted); text-transform: uppercase; letter-spacing: 0.03em;">PPG</div>
                  <div style="font-weight: 700; font-size: 1.1rem;">${group.replacement.points_per_game}</div>
                </div>
                <div>
                  <div style="font-size: 0.7rem; color: var(--theme-foreground-muted); text-transform: uppercase; letter-spacing: 0.03em;">Form</div>
                  <div style="font-weight: 700; font-size: 1.1rem; color: ${parseFloat(group.replacement.form) > 5 ? 'var(--theme-green)' : 'inherit'};">${group.replacement.form}</div>
                </div>
                <div>
                  <div style="font-size: 0.7rem; color: var(--theme-foreground-muted); text-transform: uppercase; letter-spacing: 0.03em;">ICT</div>
                  <div style="font-weight: 700; font-size: 1.1rem;">${parseFloat(group.replacement.ict_index).toFixed(1)}</div>
                </div>
                <div>
                  <div style="font-size: 0.7rem; color: var(--theme-foreground-muted); text-transform: uppercase; letter-spacing: 0.03em;">Mins</div>
                  <div style="font-weight: 700; font-size: 1.1rem;">${group.replacement.minutes}</div>
                </div>
              </div>
              ${group.startingPlayers.length > 0 ? html`
                <div style="margin-bottom: 1.25rem;">
                  <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; margin-bottom: 0.75rem; color: var(--theme-foreground-muted);">Can Replace (Starting XI)</div>
                  ${group.startingPlayers.map(player => {
                    const ppgGain = parseFloat(group.replacement.points_per_game) - parseFloat(player.points_per_game);
                    const formGain = parseFloat(group.replacement.form) - parseFloat(player.form);
                    return html`<div style="display: flex; gap: 0.75rem; align-items: center; padding: 0.75rem; background: var(--theme-background-alt); border-radius: 0.5rem; margin-bottom: 0.5rem;">
                      <img src="${getPlayerPhoto(player.code)}" style="width: 45px; height: 45px; border-radius: 50%; background: white;" alt="${player.web_name}">
                      <div style="flex: 1; min-width: 0;">
                        <div style="font-weight: 600; font-size: 0.9375rem; margin-bottom: 0.125rem;">${player.web_name}</div>
                        <div style="font-size: 0.8125rem; color: var(--theme-foreground-muted);">
                          ${player.points_per_game} PPG • Form: ${player.form} • ${player.minutes} mins
                        </div>
                      </div>
                      <div style="text-align: right;">
                        <div style="font-weight: 700; color: var(--theme-green); font-size: 1rem;">+${ppgGain.toFixed(1)}</div>
                        <div style="font-size: 0.75rem; color: ${formGain > 0 ? 'var(--theme-green)' : 'var(--theme-foreground-muted)'};">${formGain > 0 ? '+' : ''}${formGain.toFixed(1)} form</div>
                      </div>
                    </div>`;
                  })}
                </div>
              ` : ''}
              
              ${group.benchPlayers.length > 0 ? html`
                <div>
                  <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; margin-bottom: 0.75rem; color: var(--theme-foreground-muted);">Can Replace (Bench)</div>
                  ${group.benchPlayers.map(player => {
                    const ppgGain = parseFloat(group.replacement.points_per_game) - parseFloat(player.points_per_game);
                    const formGain = parseFloat(group.replacement.form) - parseFloat(player.form);
                    return html`<div style="display: flex; gap: 0.75rem; align-items: center; padding: 0.75rem; background: var(--theme-background-alt); border-radius: 0.5rem; margin-bottom: 0.5rem;">
                      <img src="${getPlayerPhoto(player.code)}" style="width: 45px; height: 45px; border-radius: 50%; background: white;" alt="${player.web_name}">
                      <div style="flex: 1; min-width: 0;">
                        <div style="font-weight: 600; font-size: 0.9375rem; margin-bottom: 0.125rem;">${player.web_name}</div>
                        <div style="font-size: 0.8125rem; color: var(--theme-foreground-muted);">
                          ${player.points_per_game} PPG • Form: ${player.form} • ${player.minutes} mins
                        </div>
                      </div>
                      <div style="text-align: right;">
                        <div style="font-weight: 700; color: var(--theme-green); font-size: 1rem;">+${ppgGain.toFixed(1)}</div>
                        <div style="font-size: 0.75rem; color: ${formGain > 0 ? 'var(--theme-green)' : 'var(--theme-foreground-muted)'};">${formGain > 0 ? '+' : ''}${formGain.toFixed(1)} form</div>
                      </div>
                    </div>`;
                  })}
                </div>
              ` : ''}
            </div>
          </div>
        </div>`;
      })
  }
</div>`
```
