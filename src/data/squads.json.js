import {api, DRAFT_LEAGUE_ID} from "./api.js";

const squads = await api.getSquads(DRAFT_LEAGUE_ID);

process.stdout.write(JSON.stringify(squads));
