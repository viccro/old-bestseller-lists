const path = require('path');
const Dotenv = require('dotenv-webpack');
const webpack = require('webpack');

module.exports = {
  entry:  {
    bookLists: './src/app.js',
    calendarSelect: './src/calendar-select.js',
    bestsellers: './src/bestseller-api.js',
    cookiesScript: './src/cookies-script.js',
    dbConfig: './src/db.js',
    index: './src/index.js',
  },
  output: {
    filename: 'bundle.[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    contentBase: './dist',
  },
  plugins: [
    new Dotenv({
      path: './src/.env'
    }),
    new webpack.ProvidePlugin({
      '$': 'jquery',
      "jQuery": "jquery"
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(scss)$/,
        use: [
          {
            // Adds CSS to the DOM by injecting a `<style>` tag
            loader: 'style-loader'
          },
          {
            // Interprets `@import` and `url()` like `import/require()` and will resolve them
            loader: 'css-loader'
          },
          {
            // Loader for webpack to process CSS with PostCSS
            loader: 'postcss-loader',
            options: {
              plugins: function () {
                return [
                  require('autoprefixer'),
                ];
              }
            }
          },
          {
            // Loads a SASS/SCSS file and compiles it to CSS
            loader: 'sass-loader'
          }
        ]
      }
    ],

  },
  externals: {
    // require("jquery") is external and available
    //  on the global var jQuery
  },
  node: {
    fs: "empty",
    dns: "empty",
    net: "empty",
    tls: "empty",
  },
};
