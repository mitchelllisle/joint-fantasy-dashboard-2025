import {api} from "./api.js";

const data = await api.getBootstrapStatic();

process.stdout.write(JSON.stringify(data));
