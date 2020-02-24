const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry:  {
    bookLists: './src/app.js',
    calendarSelect: './src/calendar-select.js',
    overdriveQuery: './src/overdrive-query.js'
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
    })
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
                  require('autoprefixer')
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
  node: {fs: "empty"}
};