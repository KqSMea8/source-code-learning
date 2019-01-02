import { log } from './util';
log('log in entry');

require.ensure(['./runtime.js', './runtime2.js'], function() {
  console.log('ensured');
});
