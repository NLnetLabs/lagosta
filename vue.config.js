const webpack = require("webpack");
const fs = require("fs");
const packageJson = fs.readFileSync("./package.json");
const version = JSON.parse(packageJson).version || 0;

module.exports = {
  devServer: {
    // Krill proxy instance (for API calls).
    // see: https://webpack.js.org/configuration/dev-server/#devserverproxy
    proxy: {
      "/api": { target: "https://localhost:3000" },
      "/auth": { target: "https://localhost:3000" },
      "/stats": { target: "https://localhost:3000" }
    },
    // Lagosta dev-server settings
    port: "3003",
    https: true
  },

  pluginOptions: {
    i18n: {
      locale: "en",
      fallbackLocale: "en",
      localeDir: "locales",
      enableInSFC: false
    }
  },

  filenameHashing: false,

  configureWebpack: {
    plugins: [
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1
      }),
      new webpack.DefinePlugin({
        "process.env": {
          PACKAGE_VERSION: '"' + version + '"'
        }
      })
    ],
    performance: {
      hints: false
    }
  },
  chainWebpack: config => {
    config.optimization.delete("splitChunks");
  }
};
