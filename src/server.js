const { polydev } = require("polydev");

const server = polydev({ assets: "/tmp/medium-to-markdown" }).listen(
  process.env.PORT || 3000,
  () => {
    console.info(`🚀 Ready! http://localhost:${server.address().port}/`);
  }
);
