import {api, DRAFT_LEAGUE_ID} from "./api.js";

const result = await api.getMatchResults(DRAFT_LEAGUE_ID);

process.stdout.write(JSON.stringify(result));
