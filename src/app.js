import React from "react";
import ReactDOM from "react-dom";
import ErrorBoundary from "react-error-boundary";

import "./app.css";
import "./medium.css";

import { ConvertPost } from "./ConvertPost";
import { getUrl } from "./getUrl";
import { FallbackComponent } from "./FallbackComponent";

const App = () => {
  return (
    <section className="bg-white flex flex-col font-serif min-h-screen shadow-inner">
      <form className="p-6">
        <fieldset className="flex flex-col">
          <label className="p-2">Medium Post URL</label>
          <input
            autoFocus
            className="font-sans w-full p-2 rounded-sm shadow-outline"
            name="url"
            defaultValue={getUrl()}
            placeholder="e.g. https://medium.com/@ericclemmons/javascript-fatigue-48d4011b6fc4"
          />
        </fieldset>
      </form>

      <ErrorBoundary FallbackComponent={FallbackComponent}>
        <ConvertPost />
      </ErrorBoundary>
    </section>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
