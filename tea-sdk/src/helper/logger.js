/* eslint-disable no-console */
import { TEA_LOGGER_PREFIX } from '../configs/constants';

class Logger {
  constructor(prefix = '') {
    const secondPrefix = prefix ? `[${prefix}]` : '';
    this.prefix = TEA_LOGGER_PREFIX + secondPrefix;
  }
  init = (bool) => {
    this.isLog = bool;
  };
  info = (message, ...args) => {
    if (this.isLog) {
      console.log(this.prefix + message, ...args);
    }
  };
  warn = (message, ...args) => {
    if (this.isLog) {
      console.warn(this.prefix + message, ...args);
    }
  };
  error = (message, ...args) => {
    if (this.isLog) {
      console.error(this.prefix + message, ...args);
    }
  };
  dir = (...args) => {
    if (this.isLog) {
      console.dir(...args);
    }
  };
  table = (data) => {
    if (this.isLog) {
      console.table(data);
    }
  };
  logJSON = (obj) => {
    if (typeof obj === 'object' && this.isLog) {
      this.info('', JSON.stringify(obj, null, 2));
    }
  };
  deprecated = (message, ...args) => {
    this.warn(`[DEPRECATED]${message}`, ...args);
  };
  throw = (msg) => {
    this.error(this.prefix);
    throw new Error(msg);
  };
}

export {
  Logger,
};
export default new Logger();
