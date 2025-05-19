
      module.exports = {
        ...require('./next.config.js'),
        experimental: {
          appDir: true,
          pagesDir: false,
        },
      }
    