function withStoreConfig(nextConfig = {}) {
  const features = nextConfig.features || {}
  delete nextConfig.features

  nextConfig.env = nextConfig.env || {}

  Object.entries(features).forEach(([key, value]) => {
    if (value) {
      nextConfig.env[`FEATURE_${key.toUpperCase()}_ENABLED`] = true
    }
  })

  // disable exporting for yarn dev
  if (process.env.NODE_ENV == 'development') {
    // TODO: may want to do this for Vercel as well in future
    delete nextConfig.output
    delete nextConfig.distDir
  }

  return nextConfig
}

module.exports = { withStoreConfig }
