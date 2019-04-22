import React from "react";

import { getUrl } from "./getUrl";

export function FallbackComponent({ componentStack, error }) {
  const status = `👋 @ericclemmons! Can you get ${getUrl()} working for me? Thanks!`;
  const params = new URLSearchParams({ status });

  return (
    <main className="py-6 shadow">
      <p>
        <strong>Whoops!</strong> I haven't seen this type of post yet&hellip;
      </p>
      <p class="bg-red text-white p-4">
        🔥 <strong>Error:</strong> {error.toString()}
      </p>
      <p>
        👉{" "}
        <a href={`https://twitter.com/home?${params}`} target="_blank">
          Let me know on Twitter
        </a>
        !
      </p>
    </main>
  );
}
