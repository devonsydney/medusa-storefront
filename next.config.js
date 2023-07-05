const { withStoreConfig } = require("./store-config")
const store = require("./store.config.json")

module.exports = withStoreConfig({
  // output: 'export', // for outputting static site files to dist folder
  // distDir: 'dist', // for outputting static site files to dist folder
  features: store.features,
  reactStrictMode: true,
  images: {
    domains: process.env.NEXT_PUBLIC_IMAGE_DOMAIN.split(","),
  },
})

console.log("next.config.js", JSON.stringify(module.exports, null, 2))
