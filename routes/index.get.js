const Bundler = require("parcel-bundler");
const path = require("path");

const publicPath = path.resolve(__dirname, "../public");
const publicUrl = "./dist";

const bundler = new Bundler(path.resolve(publicPath, "index.html"), {
  outDir: path.resolve(publicPath, publicUrl),
  publicUrl
});

module.exports = bundler.middleware();
