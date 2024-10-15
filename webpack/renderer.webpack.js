const webpack = require('webpack');

module.exports = {
  resolve: {
    fallback: {
      events: require.resolve('events/')
    },
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: require('./rules.webpack')
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser'
    })
  ]
};
