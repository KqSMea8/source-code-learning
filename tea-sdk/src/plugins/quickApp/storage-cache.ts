declare const require;
declare const console;

const storage = require('@system.storage')
import logger from './logger';

class StorageCache {
    get = (key) => {
        return new Promise((resolve, reject) => {
            storage.get({
                key,
                success: function (value: any) {
                    // logger.info('storage GET :%s', value)
                    if (value) {
                        value = JSON.parse(value);
                    }
                    resolve(value)
                },
                fail: function (data, code) {
                    logger.error(`handling fail, code = ${code}`)
                    reject({
                        data, code
                    })
                }
            })
        })
    };
    set = (key, value) => {
        return new Promise((resolve, reject) => {
            storage.set({
                key,
                value,
                success: function (data) {
                    // logger.info('storage SET :%s -- %s ', key, value)
                    resolve()
                },
                fail: function (data, code) {
                    logger.error(`handling fail, code = ${code}`)
                    reject()
                }
            })
        })
    }
}


export default new StorageCache();
