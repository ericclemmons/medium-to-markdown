const { useEffect, useState } = React;
const html = htm.bind(React.createElement);

const usePost = url => {
  const [post, setPost] = useState("");

  const loadPost = async url => {
    if (!url) {
      return;
    }

    const { pathname } = new URL(url);
    const res = await fetch(`/api/post${pathname}`);
    setPost(await res.text());
  };

  useEffect(() => {
    loadPost(url);
  }, [url]);

  return post;
};

const App = () => {
  const url = new URLSearchParams(window.location.search).get("url");
  const post = usePost(url);

  return html`
    <section>
      <style>
        html,
        body {
          margin: 0;
        }

        section {
          box-sizing: border-box;
          display: grid;
          grid-gap: 4em;
          grid-template-areas:
            "header   header"
            "raw      preview";
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          grid-template-rows: 3em 1fr;
          width: 100vw;
          height: 100vh;
          padding: 1em;
        }

        form {
          display: grid;
          grid-area: header;
        }

        pre {
          grid-area: raw;
          overflow: auto;
        }

        img {
          max-width: 100%;
        }

        main {
          grid-area: preview;
        }
      </style>

      <form>
        <label>
          Medium Post URL
        </label>
        <input name="url" defaultValue="${url}" />
      </form>

      ${post &&
        html`
          <pre>${post}</pre>
        `}
      ${post &&
        html`
          <main>
            <${ReactMarkdown} escapeHtml=${false} source=${post} />
          </main>
        `}
    </section>
  `;
};

ReactDOM.render(
  html`
    <${App} />
  `,
  document.getElementById("root")
);
