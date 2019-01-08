/**
 * Created by lingxufeng@bytedance.com from PGC-FE on 2018/2/27.
 */

class MemoryCache {
    cache: any;

    constructor() {
        this.cache = {}
    }

    set = (cacheKey, data) => {
        this.cache[cacheKey] = data
    };
    get = (cacheKey) => {
        let ret = [];
        const cache = this.cache[cacheKey];
        if (cache) {
            for (let item of cache) {
                ret.push(item)
            }
        }
        else {
            ret = [];
        }
        return ret;
    };
    clean = (cacheKey) => {
        this.cache[cacheKey] = undefined;
    }
}

export default new MemoryCache();
