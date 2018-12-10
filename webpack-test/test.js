const webpack = require('webpack');

webpack(
  {
    entry: './index.js',
  },
  (err, stat) => {
    console.log('err', err, 'stat', stat);
  },
);
