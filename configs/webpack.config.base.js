/**
 * Base webpack config used across other specific configs
 */

import path from 'path';
import { dependencies } from '../package.json';
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';

export default {
  externals: [...Object.keys(dependencies || {}).filter(d => {
    return /electron/.test(d) || d === 'keytar' || d === 'devtron' || d === 'pg-promise' || d === 'postgres-array';
  })],

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true
          }
        }
      }
    ]
  },

  output: {
    path: path.join(__dirname, '..', 'src'),
    // https://github.com/webpack/webpack/issues/1114
    libraryTarget: 'commonjs2'
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  },

  plugins: [
    new MonacoWebpackPlugin({
      // available options are documented at https://github.com/Microsoft/monaco-editor-webpack-plugin#options
      languages: ['pgsql']
    }),
  ]
};
