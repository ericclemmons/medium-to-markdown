import React from "react";

import { getUrl } from "./getUrl";

const { Fragment, useEffect, useState } = React;

const usePost = url => {
  const [post, setPost] = useState();
  const [error, setError] = useState();

  const loadPost = async url => {
    if (!url) {
      return;
    }

    try {
      const { pathname } = new URL(url);
      const res = await fetch(`/api/post${pathname}`);

      if (!res.ok) {
        return setError(await res.text());
      }

      return setPost(await res.json());
    } catch (error) {
      console.error(error);
      return setError(error);
    }
  };

  useEffect(() => {
    loadPost(url);
  }, [url]);

  return { error, post };
};

export function ConvertPost() {
  const { error, post } = usePost(getUrl());

  if (error) {
    throw error;
  }

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";

    document.head.appendChild(script);
  }, [post]);

  return (
    <Fragment>
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
    </Fragment>
  );
}
