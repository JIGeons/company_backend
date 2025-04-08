const path = require('path');
const nodeExternals = require('webpack-node-externals');
const dotenv = require('dotenv');

// 환경 변수 로드
dotenv.config({ path: `.env.release.local` });

module.exports = {
  mode: 'none',
  entry: './src/server.ts',
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@controllers': path.resolve(__dirname, 'src/controllers'),
      '@exceptions': path.resolve(__dirname, 'src/exceptions'),
      '@interfaces': path.resolve(__dirname, 'src/interfaces'),
      '@middlewares': path.resolve(__dirname, 'src/middlewares'),
      '@config': path.resolve(__dirname, 'src/config'),
      '@models': path.resolve(__dirname, 'src/models'),
      '@routes': path.resolve(__dirname, 'src/routes'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@tests': path.resolve(__dirname, 'tests'),
      'http': path.resolve(__dirname, 'node_modules/http')
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ['ts-loader'],
        exclude: /node_modules/,
      },
    ],
  },
  node: {
    __dirname: false,
  },
  externals: [nodeExternals()],
  devtool: process.env.NODE_ENV === 'prod' ? 'source-map' : 'eval-source-map',
};
