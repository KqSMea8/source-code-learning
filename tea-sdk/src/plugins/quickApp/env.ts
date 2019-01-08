/**
 * Created by lingxufeng@bytedance.com from PGC-FE on 2018/5/18.
 */
declare const require;
declare const navigator;
declare const location;
declare const JSON;
declare const console;
declare const Object;

interface UserTokenType {
    web_id: string | number,
    ssid: string,
    user_unique_id: string,
}

//https://stackoverflow.com/questions/31173738/typescript-getting-error-ts2304-cannot-find-name-require
const fetch = require('@system.fetch')
const device = require('@system.device')
const network = require('@system.network')
import { TEA_CACHE_PREFIX, REPORT_PREFIX } from './constants';
import StorageManager from './storage-cache';
import logger from './logger';

const undef = undefined;

class Env {
    envInfo: any;
    isRequestWebId: boolean;
    waitForVerifyTokens: boolean;
    realUuid: string;
    cacheKey: string;
    tokensKey: string;
    appId: string;
    isUserTokensReady: boolean;
    callback: any;

    constructor() {
        this.envInfo = {
            user: {
                user_id: undef,
                web_id: undef,
                user_unique_id: undef,
                ssid: undef,
                user_type: undef
            },
            header: {
                app_id: undef,
                app_name: undef,
                os_name: undef,
                os_version: undef,
                device_model: undef,
                ab_client: undef,
                ab_version: undef,
                traffic_type: undef,
                utm_source: undef,
                utm_medium: undef,
                utm_campaign: undef,
                headers: {
                    platform: undef,
                    sdk_version: undef,
                    browser: undef,
                    browser_version: undef,
                    region: undef,
                    province: undef,
                    city: undef,
                    language: undef,
                    timezone: undef,
                    tz_offset: undef,
                    resolution: undef,
                    screen_height: undef,
                    screen_width: undef,
                    referrer: undef,
                    referrer_host: undef,
                    custom: {}
                }
            }
        };
        // this.initDeviceInfo();
        this.isRequestWebId = false;
        this.waitForVerifyTokens = false;
        this.realUuid = '';
    }

    initDeviceInfo = () => {
        const that = this;
        // https://doc.quickapp.cn/features/system/device.html
        if (device && device.getInfo) {
            device.getInfo({
                success: function (res) {
                    that.set('brand', res.brand); //手机品牌
                    that.set('manufacturer', res.manufacturer); //设备生产商
                    that.set('device_model', res.model); //手机型号
                    that.set('product', res.product); //设备代号
                    that.set('os_name', res.osType); //客户端平台
                    that.set('os_version', res.osVersionName); //操作系统版本名称
                    that.set('os_version_code', res.osVersionCode); //操作系统版本号
                    that.set('platform_version_name', res.platformVersionName); //运行平台版本名称
                    that.set('platform_version_code', res.platformVersionCode); //运行平台版本号
                    that.set('language', res.language); //系统语言
                    that.set('region', res.language); //系统地区
                    that.set('resolution', `${res.screenWidth}x${res.screenHeight}`); //屏幕分辨率
                    that.set('screen_width', res.screenWidth); //屏幕高度
                    that.set('screen_height', res.screenHeight); //屏幕高度
                }
            });
        }
        if (network && network.getType) {
            network.getType({
                success: function (data) {
                    // 返回网络类型, 有效值：
                    // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
                    that.set('network_type', data.type);
                    // 是否按照流量计费
                    that.set('network_metered', data.metered);
                }
            })
        }
    };

    /**
     * @param appId
     * 这个动作非常早！
     */
    checkUserToken = async (appId) => {
        this.appId = appId;
        const tokensKey = `${TEA_CACHE_PREFIX}tokens_${appId}`;
        this.tokensKey = tokensKey;
        const userTokens: UserTokenType = await StorageManager.get(tokensKey) as UserTokenType;

        if (userTokens && userTokens.user_unique_id && userTokens.web_id && userTokens.ssid) {
            this.envInfo.user.user_unique_id = userTokens.user_unique_id;
            this.envInfo.user.web_id = userTokens.web_id;
            this.envInfo.user.ssid = userTokens.ssid;
            console.warn("初始化已经检测到了 webid ssid user_id，一般情况下不需要再次验证 id 了");
            this.unlock();
            return false;
        }
        else {
            return this.requestWebId(appId);
        }
    };

    requestWebId = async (appId) => {
        this.isRequestWebId = true;

        fetch.fetch({
            url: `${REPORT_PREFIX}/v1/user/webid`,
            method: 'POST',
            data: JSON.stringify({
                "app_id": appId,
                "url": "location.href",
                'user_agent': "navigator.userAgent",
                'referer': "referer",
                "user_unique_id": ""
            }),
            header: {
                "Content-Type": 'application/json; charset=utf-8'
            },
            success: async (res) => {
                const data = JSON.parse(res.data);
                if (data.e !== 0) {
                    console.error("请求 webid 失败~")
                }
                else {
                    this.isRequestWebId = false;
                    // 同步结果到envInfo 和 storage 中去
                    this.envInfo.user.ssid = data.ssid;
                    this.envInfo.user.web_id = data.web_id;
                    /**
                     * 对于匿名用户，其实有了一个完整的 webId，能上报了
                     */
                    this.envInfo.user.user_unique_id = data.web_id;
                    const newUserTokens = {
                        web_id: data.web_id,
                        ssid: data.ssid,
                        user_unique_id: data.web_id
                    };

                    await StorageManager.set(this.tokensKey, JSON.stringify(newUserTokens));
                    if (this.waitForVerifyTokens) {
                        this.lock();
                        this.verifyTokens(this.realUuid);
                    }
                    else {
                        // config 中没有 userId（异步对同步，有则一定进入 if，不会到这里）
                        // 试验了无数遍，没问题
                        this.unlock()
                        if (this.callback) {
                            this.callback();
                        }
                    }
                }
            },
            fail: () => {
                this.isRequestWebId = false;
                console.error("获取 webid 失败，数据将不会被上报");
            }
        })
    };
    verifyTokens = async (user_unique_id) => {

        const tokensKey = this.tokensKey;

        this.waitForVerifyTokens = false;
        // 设置真正的 user_unique_id 到storage和内存
        this.realUuid = `${user_unique_id}`;

        if (this.isRequestWebId) {
            this.waitForVerifyTokens = true;
            console.warn('正在请求 webid，requestSsid 将会在前者请求完毕之后被调用');
            return false;
        }
        else {
            // 初始化校验 webid，或者 webid 获取已经完成
            const userTokens: UserTokenType = await StorageManager.get(tokensKey) as UserTokenType;
            if (userTokens.user_unique_id === this.realUuid
                && userTokens.ssid
                && userTokens.web_id) {
                // ssid无需更新
                console.warn("用户身份验证完毕：", JSON.stringify(userTokens, null, 2));
                console.warn("传入的 user_id/user_unique_id 与 缓存中的完全一致，无需再次请求");
                this.unlock();
            }
            else {
                this.lock();
                this.envInfo.user.user_unique_id = this.realUuid;

                const newUserTokens = {
                    ...userTokens,
                    user_unique_id: this.realUuid
                };
                await StorageManager.set(tokensKey, JSON.stringify(newUserTokens));
                // 非主流场景，一个用户换了个号码
                // 这时我们有了真实的 web_id，有了真实的 uuid，拿到真实的 ssid 即可
                this.requestSsid();
            }
        }
    };
    requestSsid = async () => {
        const tokensKey = this.tokensKey;
        const userTokens: UserTokenType = await StorageManager.get(tokensKey) as UserTokenType;
        fetch.fetch({
            url: `${REPORT_PREFIX}/v1/user/ssid`,
            method: 'POST',
            data: JSON.stringify({
                'app_id': this.appId,
                'web_id': userTokens.web_id,
                'user_unique_id': `${userTokens.user_unique_id}`
            }),
            header: {
                "Content-Type": 'application/json; charset=utf-8'
            },
            success: async (res) => {
                this.unlock();
                const data = JSON.parse(res.data);
                if (data.e !== 0) {
                    console.error("请求 ssid 失败~");
                }
                else {
                    this.envInfo.user.ssid = data.ssid;
                    const newUserToken = {
                        ...userTokens,
                        ssid: data.ssid
                    };
                    await StorageManager.set(tokensKey, JSON.stringify(userTokens));
                    console.warn("根据 user_unique_id 更新 ssid 成功！注意：在这之前不应该有数据被发出去");
                    if (this.callback) {
                        this.callback();
                    }
                }
            },
            fail: () => {
                this.unlock();
                logger.error("根据 user_unique_id 获取新 ssid 失败");
            }
        })
    };

    // tea-web-sdk 的 env 分为了 default 和用户设置两个部分，上报的时候合并
    // 这里不这么搞，数据只有一份，覆盖就好！
    set = (key: string, value: any) => {
        if (key === 'os_version') {
            value = value + '';
        }
        if (key === "app_id") {
            this.checkUserToken(value);
        }
        if (key === "user_unique_id") {
            this.verifyTokens(value)
        }

        // 几乎都是 str，唯一一个 user_type 明确约定是 Number
        if (this.envInfo.user.hasOwnProperty(key)) {
            if (key === 'user_type') {
                value = Number(value);
                this.envInfo.user[key] = Number(value);
            } else if (key === 'user_id') {
                this.envInfo.user[key] = String(value);
                this.envInfo.user['user_unique_id'] = String(value);
            } else {
                this.envInfo.user[key] = String(value);
            }
        } else if (this.envInfo.header.hasOwnProperty(key)) {
            this.envInfo.header[key] = value;
        } else if (this.envInfo.header.headers.hasOwnProperty(key)) {
            this.envInfo.header.headers[key] = value;
        } else {
            this.envInfo.header.headers.custom[key] = value;
        }
    };

    get = () => {
        const tmp = {
            user: {},
            header: {
                headers: {
                    custom: {}
                }
            }
        };
        const envInfo = this.envInfo;
        // user copy
        const user = envInfo.user;
        const userKeys = Object.keys(user);
        for (let item of userKeys) {
            if (user[item] !== undef) {
                tmp.user[item] = user[item];
            }
        }

        //header copy;
        const header = envInfo.header;
        const headerKeys = Object.keys(header);
        for (let item of headerKeys) {
            if (header[item] !== undef && item !== 'headers') {
                tmp.header[item] = header[item];
            }
        }
        // headers copy
        const headers = envInfo.header.headers;
        const headersKeys = Object.keys(headers);
        for (let item of headersKeys) {
            if (item !== 'custom' && headers[item] !== undef) {
                tmp.header.headers[item] = headers[item];
            }
        }
        //custom copy!
        const custom = envInfo.header.headers.custom;
        const customKeys = Object.keys(custom);
        if (!customKeys.length) {
            delete tmp.header.headers.custom;
        } else {
            for (let item of customKeys) {
                tmp.header.headers.custom[item] = custom[item];
            }
        }
        const ret = {
            user: tmp.user,
            header: {
                ...tmp.header,
                headers: JSON.stringify(tmp.header.headers)
            }
        };
        return ret;
    };

    lock() {
        this.isUserTokensReady = false;
    }

    unlock() {
        this.isUserTokensReady = true;
    }
}

export default new Env();
