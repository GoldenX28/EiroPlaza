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
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
}