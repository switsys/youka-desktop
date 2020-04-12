import React from "react";
import ReactDOM from "react-dom";
import * as FullStory from "@fullstory/browser";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

if (process.env.NODE_ENV === "production") {
  FullStory.init({ orgId: "TCK6J" });
}

ReactDOM.render(<App />, document.getElementById("root"));

serviceWorker.register();
