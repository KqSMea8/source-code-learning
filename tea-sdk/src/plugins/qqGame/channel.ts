import adapter from './adapter'
import env from './env'
import mCacheManager from './memory-cache';
import sCacheManager from './storage-cache';
import postData from './network';
import {TEA_CACHE_PREFIX, REPORT_PREFIX} from './constants'


// 设计原则：
// - 上报数据用队列的方式
// - 同一时间段只允许一条数据上报，这样才能维持队列`入队`、`出队`、`删除数据`的逻辑！
class Channel {
    isReady: boolean;
    cacheKey: string;
    isReporting: boolean;
    evtParams: any;
    sliceLength: number;

    constructor() {
        this.isReady = false;
        this.isReporting = false;
        this.sliceLength = 10;
        this.cacheKey = `${TEA_CACHE_PREFIX}events`;
        this.evtParams = {};
    }

    setReady = (bool) => {
        this.isReady = bool;
        this.report();
    };
    setEvtParams = (opts) => {
        // 用户传递优先，按照时间顺序覆盖
        this.evtParams = {
            ...this.evtParams,
            ...opts
        }
    };
    event = (evtData) => {
        const cacheKey = this.cacheKey;
        const cache = mCacheManager.get(cacheKey) || [];
        cache.push(evtData);
        mCacheManager.set(cacheKey, cache);
        if (cache.length >= 5) {
            this.report();
        }
        else {
          adapter.setTimeout(() => {
                this.report();
            }, 45)
        }
    };
    /**
     * @returns {boolean}
     * 两种被调用的场景：event 就绪调用；成功/失败之后的再次调用；
     * - 整体还未就绪，则返回
     * - 整体就绪，但是当前依然有数据在发送，则返回
     * - 就绪 && 当前没有发送，则将内存缓存中的数据固化到 ls 中，删除内存中的数据
     * - 整体 ls 中的数据小于20，则发送、清除 ls
     * - 大于20，则只拿最前面的20 数据，发送、清除这20条（注意因为 isReporting 存在，这期间不可能有数据写入 ls）
     * - 成功回调：立即再次调用 report
     *      - 重新走内存缓存固化到 ls 的流程，没有数据，则返回，终止递归
     *      - 还有数据，则继续发送……直到 ls 中没有数据
     */
    report = () => {
        if (!this.isReady) {
            return false;
        }

        // 用户信息未就绪，绝对不能处理数据，否则一定是脏数据!
        if (!env.isUserTokensReady) {
            return false;
        }

        const cacheKey = this.cacheKey;
        const mCacheData = mCacheManager.get(cacheKey);

        // 清除当前的内存缓存，因为这些数据注定要固化到 ls 中去了。
        mCacheManager.clean(cacheKey);

        // event 信息与 evtParams、 envData 合并，装配成需要上报的数据，返回的是一个长度为1的数组;
        const curSendData = this.mergeEvts(mCacheData);

        // 拿到ls 中固话的旧数据，合并到当前的上报数据；
        // 注意顺序，从头部加入数据，从尾部取数据（队列）
        const oldCacheData = sCacheManager.get(cacheKey) || [];
        const newCacheData = curSendData.concat(oldCacheData);
        // 合并完毕了之后，还是没有数据;
        if (!newCacheData.length) {
            return false
        }

        // 将要当前数据固话到ls 中，顺带也把ls 中的旧数据给`覆盖了`
        this.setSCcacheData(newCacheData);
        // 当前正在上报数据，只能返回，不可能同时发送 n 条数据，会增加维护队列的成本
        if (this.isReporting) {
            return false;
        }
        else {
            const len = newCacheData.length;
            if (!len) {
                return false;
            }
            // 中间状态初始化
            let actualSendLength = 0;
            let sliceData = null;

            if (len <= this.sliceLength) {
                actualSendLength = len;
                sliceData = newCacheData;
            }
            else {
                actualSendLength = this.sliceLength;
                // 队列头部的20条加入上报队列，但这里不可以用直接删；因为必须保证数据上报 ok，才能真正的删除数据！
                sliceData = newCacheData.slice(len - this.sliceLength)
            }

            this.sendData(sliceData, actualSendLength);
        }
    };
    // delPos 等于20，或者小于20的某个常数；
    // 必须传递，因为队列的长度会变化，场景：
    // - 上报前是16条，把这16条都上报了，常理上说上报结束之后清空即可；
    // - 上报期间，陆续有5条数据进入 ls ，也就是说回调之前，队列内部其实有21条数据
    // - 如果没有 delPos，这里只能直接删除20条（其中有4条被误删了~）
    sendData = (data, delPos) => {
        // 开始上报数据，设置标识位，当前上报动作结束之前，不允许上报！
        this.isReporting = true;

        const cacheKey = this.cacheKey;

        postData(data, () => {
            this.isReporting = false;

            // 拿到当前 ls 中固化的数据，把上报成功的那部分数据删除掉！注意看注释，不一定就是末尾的20条~
            const actualCacheData = sCacheManager.get(cacheKey);

            // 这里的 len 会变化，因为上报期间，也会有内存——>ls 的动作
            // 要是上报之前的 len 大于20还好，小于20则就必须告知具体上报的条数！
            const actualCacheLength = actualCacheData.length;

            // 初始数据大于20条，则 delPos 等于20条，中间没有内存——>ls 操作，这里实际上就是删除20条
            // 初始数据大于20条，则 delPos 等于20条，中间有内存——>ls 操作，不影响，还是删除20条
            // 初始数据小于20条（例如16条），中间没有内存——>ls 的操作，这里实际上删除16条（清空）
            // 初始数据小于20条（例如16条），中间有内存——>ls 的操作，这里实际上还是删除16条（注意，并没有清空……）
            const remainCacheData = actualCacheData.slice(0, actualCacheLength - delPos);

            sCacheManager.set(cacheKey, JSON.stringify(remainCacheData));
            // 检查 mCache，如果有数据，立即上报
            this.report();
        }, () => {
            // 成功、失败，都必须标明本次的动作完成
            this.isReporting = false;
            // // 失败之后，隔3s 尝试一次
            adapter.setTimeout(() => {
                this.report();
            }, 3000)
        });
    };
    setSCcacheData = (data) => {
        // 合并完毕之后再 set 回去
        // 后续确定上报 ok 之后，再清除该 item
        sCacheManager.set(this.cacheKey, JSON.stringify(data));
    };
    mergeEvts = (arr: any /*原始事件数据*/) => {
        if (!arr.length) {
            return [];
        }
        let mergedData = {
            events: [],
            user: {},
            header: {}
        };
        const evtParams = this.evtParams;
        const evtParamsKeys = Object.keys(evtParams);
        // 逐个检查，把evtParams加上（注意用户设置优先）
        for (let evt of arr) {
            for (let evtParamsKey of evtParamsKeys) {
                // 根本没有上报，排除0、false、''
                if (evt.params[evtParamsKey] === undefined) {
                    evt.params[evtParamsKey] = evtParams[evtParamsKey];
                }
            }
            const params = JSON.stringify(evt.params);
            evt.params = params;
        }
        mergedData.events = arr;
        const envData = env.get();
        mergedData.events = arr;
        mergedData.user = envData.user;
        mergedData.header = envData.header;
        return [mergedData];
    }
}

export default Channel
