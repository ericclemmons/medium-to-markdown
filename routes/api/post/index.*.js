const fetch = require("node-fetch");
const prettier = require("prettier");

module.exports = async (req, res) => {
  const pathname = req.params[0];

  const response = await fetch(`https://medium.com/${pathname}?format=json`);
  const text = await response.text();
  const json = JSON.parse(text.slice(16));

  const { paragraphs } = json.payload.value.content.bodyModel;
  const markdown = paragraphs
    .map(paragraph => {
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
          // TODO Use ?format=JSON
          // Embed tweets via:
          // https://publish.twitter.com/oembed?url=https://twitter.com/Interior/status/463440424141459456
          return `<iframe src="https://medium.com/media/${
            iframe.mediaResourceId
          }"></iframe>`;
        case 13:
          return `### ${text}`;
      }

      console.error(paragraph);
      throw new Error(`Unknown type: ${type}`);
    })
    .join("\n\n");

  res.send(prettier.format(markdown, { parser: "markdown" }));
};
