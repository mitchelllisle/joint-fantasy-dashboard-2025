import { LLMSummary } from "./llmSummary.js";
import { api, DRAFT_LEAGUE_ID } from "./api.js";

const llm = new LLMSummary();

// Get current standings and match results
const standings: any = await api.getStandings(DRAFT_LEAGUE_ID);
const matchResults: any = await api.getMatchResults(DRAFT_LEAGUE_ID);

// Calculate current gameweek
const maxGameweek = Math.max(...matchResults.data.map((d: any) => d.gameweek));

// Prepare standings data for LLM (standings is already an array)
const standingsData = standings
  .sort((a: any, b: any) => a.rank - b.rank)
  .map((entry: any) => ({
    rank: entry.rank,
    team: entry.name,
    manager: entry.user,
    points: entry.total
  }));

// Generate summaries
const heroSummary = await llm.generateHeroSentence(standingsData, maxGameweek);
const gameweekTitle = await llm.generateGameweekTitle(standingsData, maxGameweek);

const formSummary = await llm.generateChartSummary(
  "form",
  matchResults.data,
  "Shows each team's points over the last 5 gameweeks. Look for trends and momentum."
);

const consistencyTitle = await llm.generateGameweekTitle(standingsData, maxGameweek);
const consistencySummary = await llm.generateChartSummary(
  "Consistency & Performance Range",
  matchResults.data,
  "Highlights each team's best, worst, and average gameweek. Shorter bars = more consistent."
);

process.stdout.write(JSON.stringify({
  hero: heroSummary,
  title: gameweekTitle,
  formChart: formSummary,
  consistencyTitle,
  consistencySummary,
  gameweek: maxGameweek
}, null, 2));
