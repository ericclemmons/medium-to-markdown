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
    <section>
      <form>
        <label>Medium Post URL</label>
        <input name="url" defaultValue={url} />
      </form>

      {post && <pre>{post.markdown}</pre>}

      {post && <main dangerouslySetInnerHTML={{ __html: post.markup }} />}
    </section>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
