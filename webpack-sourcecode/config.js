const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

function p1() {}
p1.prototype.apply = compiler => {
  compiler.hooks.beforeRun.tap('p1', compiler => {
    console.log('beforeRun  p1');
    // throw 'p1 error';
  });
};

function p2() {}
p2.prototype.apply = compiler => {
  compiler.hooks.run.tap('p2', compiler => {
    console.log('run  p2');
  });
};

module.exports = {
  entry: './webpack-sourcecode/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[chunkhash].js',
  },
  plugins: [new p1(), new p2(), new CleanWebpackPlugin(path.resolve(__dirname, 'webpack-sourcecode/dist'))],
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.png$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
            },
          },
        ],
      },
    ],
  },
  resolveLoader: {
    alias: {
      'babel-loader': path.resolve(__dirname, './my-babel-loader.js'),
    },
  },
  mode: 'development',
  devtool: 'cheap-source-map',
};
