const path = require('path');

module.exports = [
  {
    entry: './src/index.tsx',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]
    },
    resolve: {
      extensions: [ '.tsx', '.ts', '.js' ]
    },
    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, 'dist')
    },
    watch: true,
    mode: "development"
  },
  {
    entry: './src/server.ts',
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/
        }
      ]
    },
    resolve: {
      extensions: [ '.ts', '.js' ]
    },
    output: {
      filename: 'server.js',
      path: path.resolve(__dirname, 'dist')
    },
    watch: true,
    mode: "development",
    target: "node"
  }
];
