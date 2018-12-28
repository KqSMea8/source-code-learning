import './index.css';

import { log } from './util';
log('abc');
console.log(123);

require.ensure(['./runtime.js'], function() {
  console.log('ensured');
});

class People {
  constructor(name) {
    this.name = name;
  }

  sayName() {
    log(`Hello there, I'm ${this.name}`);
  }
}

const lily = new People('Lily');
lily.sayName();
