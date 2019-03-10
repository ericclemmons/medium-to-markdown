import React from "react";
import ReactDOM from "react-dom";

import "./app.css";
import "./medium.css";

const { useEffect, useState } = React;

const usePost = url => {
  const [post, setPost] = useState("");

  const loadPost = async url => {
    if (!url) {
      return;
    }

    const { pathname } = new URL(url);
    const res = await fetch(`/api/post${pathname}`);

    setPost(await res.json());
  };

  useEffect(() => {
    loadPost(url);
  }, [url]);

  return post;
};

const App = () => {
  const url = new URLSearchParams(window.location.search).get("url");
  const post = usePost(url);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";

    document.head.appendChild(script);
  }, [post]);

  return (
    <section className="bg-white flex flex-col font-serif min-h-screen shadow-inner">
      <form className="p-6">
        <fieldset className="flex flex-col">
          <label className="p-2">Medium Post URL</label>
          <input
            autoFocus
            className="font-sans w-full p-2 rounded-sm shadow-outline"
            name="url"
            defaultValue={url}
          />
        </fieldset>
      </form>

      {post && (
        <pre className="border-b h-64 font-mono bg-grey-lighter p-6 overflow-auto shadow-inner">
          {post.markdown}
        </pre>
      )}

      {post && (
        <main
          className="py-6"
          dangerouslySetInnerHTML={{ __html: post.markup }}
        />
      )}
    </section>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
