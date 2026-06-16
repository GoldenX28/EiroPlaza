const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
  lintOnSave: false,
  chainWebpack: (config) => {
    config.plugin('eslint')
      .use(ESLintPlugin, [{
        fix: true,
        extensions: ['js', 'vue'],
        files: ['src/**/*.{js,vue}']
      }])
  },
  devServer: {
    host: '0.0.0.0',
    port: 8080,
    client: {
      webSocketURL: {
        protocol: 'ws',
        hostname: 'localhost',
        port: 8080,
        pathname: '/ws'
      }
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
}
