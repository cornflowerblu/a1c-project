const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');

const path = require('path');
const fullPath = path.join(__dirname, '../dist/api')

module.exports = {
  output: {
    path: fullPath,
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
    }),
  ],
};
