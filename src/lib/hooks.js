import ua from "universal-analytics";
import { useEffect } from "react";
import { v4 as uuid4 } from "uuid";
import config from "../config";
import store from "./store";

export const stats = store.get("stats");
export const user = store.get("user", uuid4());
export const visitor = ua(config.ua, user);

store.set("user", user);

export function usePageView(path) {
  if (!stats) return;

  useEffect(() => {
    visitor.pageview(path).send();
  }, [path]);
}

export function useEvent(category, action, label) {
  if (!stats) return;

  useEffect(() => {
    visitor.event(category, action, label).send();
  }, [category, action, label]);
}
