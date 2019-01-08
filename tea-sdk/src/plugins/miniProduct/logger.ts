/**
 * Created by lingxufeng@bytedance.com from PGC-FE on 2018/5/18.
 */
declare const console;
const prefix = 'tea-sdk:';
class Logger {
  isLog: boolean;

  constructor() {
    this.isLog = false;
  }

  init = bool => {
    this.isLog = bool;
  };
  info = (...args) => {
    if (this.isLog) {
      console.log(prefix, ...args);
    }
  };
  error = (...args) => {
    if (this.isLog) {
      console.log(' ');
      console.error(prefix, ...args);
      console.log(' ');
    }
  };
  warn = (...args) => {
    if (this.isLog) {
      console.warn(prefix, ...args);
    }
  };
}

export default new Logger();
