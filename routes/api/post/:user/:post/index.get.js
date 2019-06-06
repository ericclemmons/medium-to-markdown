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

const convertPost = async (user, post) => {
  const raw = await fetchJSON(
    `https://medium.com/${user}/${post}?format=json`,
    16
  );

  if (raw.error) {
    throw new Error(raw.error);
  }

  const {
    firstPublishedAt,
    latestPublishedAt,
    slug,
    title
  } = raw.payload.value;

  const { paragraphs, sections } = raw.payload.value.content.bodyModel;

  const blocks = await Promise.all(
    paragraphs.map(async paragraph => {
      const { iframe, metadata, mixtapeMetadata, name, text, type } = paragraph;

      // About to mutate this bia bia
      let markups = JSON.parse(JSON.stringify(paragraph.markups));

      markups.sort((a, b) => {
        return a.start - b.start || a.end - b.end;
      });

      let formatted = text;

      while (markups.length) {
        const markup = markups.shift();

        let prefix = "";
        let suffix = "";

        switch (markup.type) {
          case 1:
            prefix = "**";
            suffix = "**";
            break;
          case 2:
            prefix = "*";
            suffix = "*";
            break;

          case 3:
            prefix = `[`;

            switch (markup.anchorType) {
              case 0:
                suffix = `](${markup.href})`;
                break;
              case 2:
                suffix = `](https://medium.com/u/${markup.userId})`;
                break;
              default:
                console.error(paragraph);
                throw new Error(`Unsupported anchorType: ${markup.anchorType}`);
            }

            break;

          case 10:
            prefix = "`";
            suffix = "`";
            break;

          default:
            console.error(paragraph);
            throw new Error(`Unsupported markup type: ${markup.type}`);
        }

        formatted = [
          formatted.slice(0, markup.start),
          prefix,
          formatted.slice(markup.start, markup.end),
          suffix,
          formatted.slice(markup.end)
        ].join("");

        markups.forEach(next => {
          // Markup before changes aren't shifted
          if (next.end <= markup.start) {
            return;
          }

          // Markup after changes is shifted by additional characters
          if (next.start >= markup.end) {
            next.start += prefix.length + suffix.length;
            next.end += prefix.length + suffix.length;
            return;
          }

          // Markup inside has to take account of prefix + suffix
          next.start += prefix.length;
          next.end += prefix.length;
        });
      }

      switch (type) {
        case 1:
          return formatted;

        case 3:
          return `# ${formatted}`;

        case 4:
          const url = `https://cdn-images-1.medium.com/max/${metadata.originalWidth *
            2}/${metadata.id}`;

          return `![${formatted}](${url})`;

        case 6:
          return `> ${formatted}`;

        case 7:
          return `### ${formatted}`;

        case 8:
          return "```\n" + formatted + "\n```";

        case 9:
          return `- ${formatted}`;

        case 10:
          return `1. ${formatted}`;

        case 11:
          var resource = (await fetchJSON(
            `https://medium.com/media/${iframe.mediaResourceId}?format=json`,
            16
          )).payload.value;

          switch (resource.mediaResourceType) {
            // Example: https://medium.com/storybookjs/storybook-docs-sneak-peak-5be78445094a
            case "MediaResourceExternalLink":
              return `<iframe
                width="${resource.iframeWidth}"
                height="${resource.iframeHeight}"
                src="${resource.iframeSrc}"
                frameborder="0"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>`;

            case "MediaResourceTweet":
              const tweet = await fetchJSON(
                `https://publish.twitter.com/oembed?url=${resource.href}`
              );

              return tweet.html;
          }

          console.error(resource);
          throw new Error(`Unsupported type: ${resource.mediaResourceType}`);

        case 13:
          return `#### ${formatted}`;

        case 14:
          var resource = (await fetchJSON(
            `https://medium.com/media/${
              mixtapeMetadata.mediaResourceId
            }?format=json`,
            16
          )).payload.value;

          return `
> [**${resource.title}**](${resource.href})
>
> <small>${resource.description}</small>
          `;
      }

      console.error(paragraph);
      throw new Error(`Unsupported type: ${type}`);
    })
  );

  sections.slice(1).forEach((section, i) => {
    blocks.splice(section.startIndex + i, 0, "---");
  });

  const frontmatter = `
  ---
  firstPublishedAt: ${firstPublishedAt}
  latestPublishedAt: ${latestPublishedAt}
  slug: ${slug}
  title: ${title}
  ---
  `;

  const markup = renderToStaticMarkup(
    createElement(ReactMarkdown, {
      escapeHtml: false,
      source: prettier.format(blocks.join("\n\n"), { parser: "markdown" })
    })
  );

  const markdown = prettier.format([frontmatter].concat(blocks).join("\n\n"), {
    parser: "markdown"
  });

  return { markdown, markup, raw };
};

module.exports = async (req, res) => {
  const { user, post } = req.params;

  try {
    res.json(await convertPost(user, post));
  } catch (error) {
    res.status(500).send(error.message);
  }
};
