// import logger from '../helper/logger';

function isSupportLS() {
  try {
    localStorage.setItem('_____tea-sdk-test-key', 'hi');
    localStorage.getItem('_____tea-sdk-test-key');
    localStorage.removeItem('_____tea-sdk-test-key');
    // localStorage.clear();
    return true;
  } catch (e) {
    return false;
  }
}

const StorageCache = {
  getItem(key) {
    try {
      const value = localStorage.getItem(key);
      let ret = value;

      try {
        if (value && typeof value === 'string') {
          ret = JSON.parse(value);
        }
      } catch (e) {}

      return ret || undefined;
    } catch (e) { }
    return undefined;
  },
  setItem(key, value) {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, stringValue);
    } catch (e) {
      // logger.error(e);
    }
  },
  removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {}
  },
  clear() {
    try {
      localStorage.clear();
    } catch (e) {}
  },
  isSupportLS: isSupportLS(),
};

export default StorageCache;
