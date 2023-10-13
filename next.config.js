const { withStoreConfig } = require("./store-config")
const store = require("./store.config.json")
module.exports = withStoreConfig({
  output: "export", // for outputting static site files to dist folder
  distDir: "dist", // for outputting static site files to dist folder
  trailingSlash: true,
  features: store.features,
  reactStrictMode: true,
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    loader: "custom",
    loaderFile: "./image.ts",
  },
})

console.log("next.config.js", JSON.stringify(module.exports, null, 2))
