/**
 * Created by lingxufeng@bytedance.com from PGC-FE on 2017/12/22.
 */
const path = require('path');
const os = require('os');
const HappyPack = require('happypack');
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const version = process.env.npm_package_version;

module.exports = {
  entry: {
    index: ['webpack/hot/only-dev-server', './src/app/web-entry.js'],
    // 测试文件入口。测试npm引用方式。
    bundle_vendor: './demo/bundle_vendor.js',
    common_test: './demo/common_test.js',
  },
  output: {
    filename: '[name].js',
    path: resolve('output/resource/tech'),
    publicPath: '/',
  },
  devtool: 'cheap-source-map',
  devServer: {
    port: 8899,
    disableHostCheck: true,
    host: '0.0.0.0',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'happypack/loader?id=happybabel',
      },
    ],
  },
  resolve: {
    extensions: ['*', '.js', '.jsx'],
  },

  plugins: [
    new HappyPack({
      id: 'happybabel',
      loaders: ['babel-loader'],
      threadPool: happyThreadPool,
      verbose: true,
    }),
    new webpack.DefinePlugin({
      SDK_VERSION: JSON.stringify(version),
      POST_HOST: JSON.stringify('http://10.8.131.217:9908'),
    }),
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(__dirname, './demo/index.html'),
      chunks: ['index'],
      hash: true,
      cache: true,
    }),
  ],
};

function resolve(dir) {
  return path.resolve(__dirname, dir);
}
