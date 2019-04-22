const Bundler = require("parcel-bundler");
const bundler = new Bundler("./src/index.html", {
  outDir: "/tmp/medium-to-markdown"
});

module.exports = bundler.middleware();
