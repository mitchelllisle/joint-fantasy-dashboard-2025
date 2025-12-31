import { LLMSummary } from "./llmSummary.js";
import { api, DRAFT_LEAGUE_ID } from "./api.js";

const squads = await api.getSquads(DRAFT_LEAGUE_ID);

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

const chartSummaries: any = {};
chartSummaries.bonusPoints = {
  title: await llm.generateChartSummary("Bonus Points Chart Title", squads, "Bonus points vs total points for all players."),
  subtitle: await llm.generateChartSummary("Bonus Points Chart Subtitle", squads, "Describe the main trend in bonus points.")
};
chartSummaries.bumpChart = {
  title: await llm.generateChartSummary("Rank Across Gameweeks Chart Title", matchResults.data, "League rank changes by gameweek."),
  subtitle: await llm.generateChartSummary("Rank Across Gameweeks Chart Subtitle", matchResults.data, "Describe the key trend in league rank changes.")
};
chartSummaries.pointsPerWeek = {
  title: await llm.generateChartSummary("Points Per Gameweek Chart Title", matchResults.data, "Points scored per gameweek by team."),
  subtitle: await llm.generateChartSummary("Points Per Gameweek Chart Subtitle", matchResults.data, "Describe the main trend in points per gameweek.")
};
chartSummaries.pointsBarChart = {
  title: await llm.generateChartSummary("Score Per Gameweek Chart Title", matchResults.data, "Bar chart of points scored per gameweek."),
  subtitle: await llm.generateChartSummary("Score Per Gameweek Chart Subtitle", matchResults.data, "Describe the main trend in points scored per gameweek.")
};
chartSummaries.formChart = {
  title: await llm.generateChartSummary("Last 5 Gameweeks Form Chart Title", matchResults.data, "Form over the last 5 gameweeks."),
  subtitle: await llm.generateChartSummary("Last 5 Gameweeks Form Chart Subtitle", matchResults.data, "Describe the main trend in form over the last 5 gameweeks.")
};


process.stdout.write(JSON.stringify({
  hero: heroSummary,
  title: gameweekTitle,
  gameweek: maxGameweek,
  chartSummaries
}, null, 2));
