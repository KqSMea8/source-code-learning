import logger from './logger'
import adapter from './adapter'

class StorageCache {
    get = (key) => {
        let ret: any = '';
        try {
            let value = adapter.localStorage.getItem(key);
            if (value) {
                value = JSON.parse(value);
                ret = value;
            }
        } catch (e) {
          logger.error(e.message);
        }
        return ret;
    };
    set = (key, value) => {
        try {
          adapter.localStorage.setItem(key, value)
        }
        catch (e) {
          logger.error(e)
        }
    }
}


export default new StorageCache();
