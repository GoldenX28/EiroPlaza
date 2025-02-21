module.exports = {
  lintOnSave: false,
  chainWebpack: (config) => {
    config.plugin('eslint').tap((args) => {
      args[0].fix = true
      return args
    })
  }
}