import {api, DRAFT_LEAGUE_ID} from "./api.js";

const standings = await api.getStandings(DRAFT_LEAGUE_ID);

process.stdout.write(JSON.stringify(standings));
