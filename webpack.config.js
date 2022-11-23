import path from 'path';

export default {
  mode: 'production',
  entry: {
    index: path.resolve('./src/index.ts'),
    main: path.resolve('./src/main.ts'),
  },
  target: 'node',
  resolve: {
    extensions: ['.js', '.ts'],
    modules: ['node_modules']
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        use: {
          loader: 'babel-loader'
        },
        exclude: [path.resolve('./node_modules'), /(spec|test)\.(js|ts)$/]
      }
    ]
  },
  externals: [/(node_modules|main\..*\.js)/, ],
  output: {
    path: path.resolve('./dist'),
    filename: '[name].js',
    libraryTarget: 'module',
    chunkFormat: 'module',
  },
  optimization: {
    minimize: true
  },
  experiments: {
    outputModule: true
  }
};
