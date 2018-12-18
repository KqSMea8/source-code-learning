const webpack = require('webpack');

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

webpack(
  {
    entry: './webpack-sourcecode/index.js',
    plugins: [new p1(), new p2()],
  },
  (err, stat) => {
    console.error('err', err);
    console.log('stat', stat);
  },
);
