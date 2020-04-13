import ua from "universal-analytics";
import config from "../config";
import store from "./store";
import { user } from "./user";

const uaid = store.get("stats") ? config.ua : "";

export const visitor = ua(uaid, user);
