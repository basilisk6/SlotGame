import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  entry: ['webpack-dev-server/client', './src/index.js'],
  output: {
    path: resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  target: 'web',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
    ],
  },
  devtool: "source-map",
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: './src/assets', to: 'assets' },
      ],
    }),
  ],
  devServer: {
    static: {
      directory: resolve(__dirname, 'dist'),
    },
    port: 8000,
    open: true,
    hot: true,
    compress: true,
    historyApiFallback: true,
  },
  experiments: {
    topLevelAwait: true,
  },
  watchOptions: {
    ignored: /node_modules/,
    poll: 1000,
    aggregateTimeout: 500,
  }
};
