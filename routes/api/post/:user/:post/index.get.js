const fetch = require("node-fetch");
const prettier = require("prettier");
const { createElement } = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const ReactMarkdown = require("react-markdown");

const fetchJSON = async (url, startAt = 0) => {
  const response = await fetch(url);
  const text = await response.text();
  const json = JSON.parse(text.slice(startAt));

  return json;
};

module.exports = async (req, res) => {
  const { user, post } = req.params;

  const raw = await fetchJSON(
    `https://medium.com/${user}/${post}?format=json`,
    16
  );

  const { paragraphs } = raw.payload.value.content.bodyModel;

  const blocks = await Promise.all(
    paragraphs.map(async paragraph => {
      const { iframe, markups, metadata, name, type, text } = paragraph;

      switch (type) {
        case 1:
          return text;

        case 3:
          return `# ${text}`;

        case 4:
          const url = `https://cdn-images-1.medium.com/max/${metadata.originalWidth *
            2}/${metadata.id}`;

          return `![${text}](${url})`;

        case 6:
          return `> ${text}`;

        case 7:
          return `> ## ${text}`;

        case 9:
          return `- ${text}`;

        case 11:
          const resource = (await fetchJSON(
            `https://medium.com/media/${iframe.mediaResourceId}?format=json`,
            16
          )).payload.value;

          switch (resource.mediaResourceType) {
            case "MediaResourceTweet":
              const tweet = await fetchJSON(
                `https://publish.twitter.com/oembed?url=${resource.href}`
              );

              return tweet.html;
          }

          console.error(resource);
          throw new Error(`Unknown type: ${resource.mediaResourceType}`);

        case 13:
          return `### ${text}`;
      }

      console.error(paragraph);
      throw new Error(`Unknown type: ${type}`);
    })
  );

  const markdown = prettier.format(blocks.join("\n\n"), { parser: "markdown" });

  const markup = renderToStaticMarkup(
    createElement(ReactMarkdown, {
      escapeHtml: false,
      source: markdown
    })
  );

  res.json({ markdown, markup, raw });
};
