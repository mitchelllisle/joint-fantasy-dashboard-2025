---
theme: [dashboard, midnight]
title: Dashboard
---

```js
import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";
import {
  bumpChart,
  pointsPerWeek,
  pointsBarChart,
  giniIndexChart,
  benchPoints,
  positionBreakdown,
  consistencyBullet,
  formChart,
  bonusPoints
} from "npm:joint-fpl-lib";
```

```js
function sparkbar(max) {
  return (x) => htl.html`<div style="
    background: var(--theme-green);
    color: black;
    font: 10px/1.6 var(--sans-serif);
    width: ${100 * x / max}%;
    float: right;
    padding-right: 3px;
    box-sizing: border-box;
    overflow: visible;
    display: flex;
    justify-content: end;">${x.toLocaleString("en-US")}`
}
```

```js
const bootstrapStatic = FileAttachment("data/bootstrapStatic.json").json();
const details = FileAttachment("data/details.json").json();
const matchResults = FileAttachment("data/matchResults.json").json();
const squads = FileAttachment("data/squads.json").json();
const summaries = FileAttachment("data/summaries.json").json();
```

```js
const maxGameweek = d3.max(matchResults.data, d => d.gameweek);
```

```js
function filterForRank(data, rank, maxGameweek) {
  const filtered = data.filter((d) => d.rank === rank && d.gameweek === maxGameweek);
  return filtered[0];
};

function choice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const firstEmojis = ["😁", "🥇", "🎉", "🎊"];
const lastEmojis = ["😭", "😰", "💀️", "🙈"];

const userInFirst = filterForRank(matchResults.data, 1, maxGameweek) || {};
const userInSecond = filterForRank(matchResults.data, 2, maxGameweek) || {};
const userInThird = filterForRank(matchResults.data, 3, maxGameweek) || {};
const userInLast = filterForRank(matchResults.data, details.length, maxGameweek) || {};

const firstToSecondPointsGap = userInFirst.total && userInSecond.total ? Math.abs(userInFirst.total - userInSecond.total) : 0;
const secondToThirdPointsGap = userInSecond.total && userInThird.total ? Math.abs(userInSecond.total - userInThird.total) : 0;
const thirdToLastPointsGap = userInThird.total && userInLast.total ? Math.abs(userInThird.total - userInLast.total) : 0;
const lastToFirstPointsGap = userInLast.total && userInFirst.total ? Math.abs(userInLast.total - userInFirst.total) : 0;
```

<div class="hero">
  <h1>Gameweek ${maxGameweek}: ${summaries.title}</h1>
  <p style="font-size: 1.2rem; color: var(--theme-foreground-muted);">${summaries.hero}</p>
</div>

```js
// Only show cards if we have valid data
if (userInFirst.total && userInLast.total) {
  display(html`
    <div class="grid grid-cols-4">
      <a class="card" style="color: inherit;">
        <h2>🏆 1st Place</h2>
        <br>
        <span class="big">${userInFirst.player_first_name} ${choice(firstEmojis)}</span>
        <br>
        <br>
        <span class="muted">
            ${userInFirst.player_first_name} is winning with <b style="color: #00ff85">${userInFirst.total}</b> points. 
            He is <b style="color: #00ff85">${firstToSecondPointsGap}</b> points off ${userInSecond.player_first_name || "second place"} in second
            and <b style="color: #00ff85">${lastToFirstPointsGap}</b> points away from last.
        </span>
      </a>
      <a class="card" style="color: inherit;">
        <h2>💰 Last Place</h2>
        <br>
        <span class="big">${userInLast.player_first_name} ${choice(lastEmojis)}</span>
        <br>
        <br>
        <span class="muted">
            ${userInLast.player_first_name} is in last place on <b style="color: #e90052">${userInLast.total}</b> points. 
            He is <b style="color: #e90052">${thirdToLastPointsGap}</b> points off ${userInThird.player_first_name || "third place"} in third
            and <b style="color: #e90052">${lastToFirstPointsGap}</b> off first place.
        </span>
      </a>
    </div>
  `);
}
```

<div class="grid grid-cols-1">
  <div class="card">
    ${resize((width) => bumpChart(matchResults.data, {
      Plot, d3, width,
      subtitle: summaries.chartSummaries.bumpChart.subtitle
    }))}
  </div>

  <style>

.inputs-3a86ea-input {
    height: 40px;
}

</style>

</div>

<hr>

## Player Analytics

```js
const playerOptions = ["All", ...new Set(details.map(d => d.name))];
const player = view(Inputs.select(
  playerOptions,
  {value: "All"}
));
```

```js
function filterForInput(data, player, field) {
  if (player === "All") return data;
  return data.filter(d => d[field] === player);
}

const matchResultsUser = filterForInput(matchResults.data, player, "team");
const detailsUser = filterForInput(details, player, "name");
const squadsUser = filterForInput(squads, player, "owner");

// Calculate season-long bench points
// Create data structure that benchPoints chart expects, but use total_points for season aggregation
const benchPlayers = squadsUser.filter(p => p.position > 11);
const seasonBenchPoints = benchPlayers.map(p => ({
  ...p,
  event_points: p.total_points // Use total_points instead of event_points for season aggregation
}));
```

<div class="grid grid-cols-2">
  <div class="card">
    ${resize((width) => pointsPerWeek(matchResultsUser, {
        Plot, 
        d3, 
        width,
        subtitle: summaries.chartSummaries.pointsPerWeek.subtitle
      }))}
  </div>
  <div class="card">
    ${resize((width) => pointsBarChart(matchResultsUser, {
      Plot, d3, width,
      subtitle: summaries.chartSummaries.pointsBarChart.subtitle
    }))}
  </div>
</div>

<div class="grid grid-cols-2">
  <div class="card">
    ${resize((width) => formChart(matchResultsUser, {
      Plot, d3, width,
      subtitle: summaries.chartSummaries.formChart.subtitle
    }))}
    
  </div>
  <div class="card">
    ${resize((width) => consistencyBullet(matchResultsUser, {
      Plot, d3, width,
      title: summaries.consistencyChartTitle,
      subtitle: summaries.consistencyChartSubtitle
    }))}
    
  </div>
</div>

<div class="grid grid-cols-2">
  <div class="card">
    ${resize((width) => positionBreakdown(squadsUser, {Plot, d3, width}))}
  </div>
  <div class="card">
    ${resize((width) => benchPoints(seasonBenchPoints, {
      Plot, 
      d3, 
      width,
      subtitle: "Total points scored by benched players this season"
    }))}
  </div>
</div>

<div class="grid grid-cols-3">
  <div class="card" style="grid-column: span 2;">
    ${resize((width) => bonusPoints(squadsUser, {
      Plot, d3, width,
      subtitle: summaries.chartSummaries.bonusPoints.subtitle
    }))}
  </div>
  <div class="card">
    ${resize((width) => giniIndexChart(squadsUser, {Plot, d3, width}))}
  </div>
</div>
