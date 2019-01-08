/**
 * Created by lingxufeng@bytedance.com from PGC-FE on 2018/5/18.
 */
import {TEA_CACHE_PREFIX, REPORT_PREFIX} from './constants';
import StorageManager from './storage-cache';
import logger from './logger';

declare const wx;
declare const navigator;
declare const location;
declare const JSON;
declare const console;
declare const Object;

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
        this.initDeviceInfo();
        this.isRequestWebId = false;
        this.waitForVerifyTokens = false;
        this.realUuid = '';
    }

    initDeviceInfo = () => {
        const that = this;
        if (wx && wx.getSystemInfo) {
            // https://developers.weixin.qq.com/miniprogram/dev/api/systeminfo.html#wxgetsysteminfoobject
            wx.getSystemInfo({
                success: function (res) {
                    that.set('brand', res.brand); //手机品牌
                    that.set('device_model', res.model); //手机型号
                    that.set('pixelRatio', res.pixelRatio); //设备像素比
                    that.set('resolution', `${res.screenWidth}x${res.screenHeight}`); //屏幕分辨率
                    that.set('screen_width', res.screenWidth); //屏幕高度
                    that.set('screen_height', res.screenHeight); //屏幕高度
                    that.set('windowWidth', res.windowWidth); //可使用窗口宽度
                    that.set('windowHeight', res.windowHeight); //可使用窗口高度
                    that.set('statusBarHeight', res.statusBarHeight); //状态栏的高度
                    that.set('language', res.language); //微信设置的语言
                    that.set('wx_version', res.version); //微信版本号
                    that.set('os_version', res.system); //操作系统版本
                    that.set('os_name', res.platform); //客户端平台
                    that.set('fontSizeSetting', res.fontSizeSetting); //用户字体设置
                    that.set('SDKVersion', res.SDKVersion); //客户端基础库版本

                    that.set('platform', 'miniProduct'); //客户端平台
                }
            });
        }
        if (wx && wx.getNetworkType) {
            wx.getNetworkType({
                success: function (res) {
                    // 返回网络类型, 有效值：
                    // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
                    that.set('networkType', res.networkType);
                }
            });
        }
    };

    /**
     * @param appId
     * 这个动作非常早！
     */
    checkUserToken = (appId) => {
        this.appId = appId;
        const tokensKey = `${TEA_CACHE_PREFIX}tokens_${appId}`;
        this.tokensKey = tokensKey;
        const userTokens = StorageManager.get(tokensKey);

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

    requestWebId = (appId) => {
        this.isRequestWebId = true;

        wx.request({
            url: `${REPORT_PREFIX}/v1/user/webid`,
            method: 'POST',
            data: {
                "app_id": appId,
                "url": "location.href",
                'user_agent': "navigator.userAgent",
                'referer': "referer",
                "user_unique_id": ""
            },
            dataType: "json",
            header: {
                "Content-Type": 'application/json; charset=utf-8'
            },
            success: (res) => {
                const data = res.data;
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

                    StorageManager.set(this.tokensKey, JSON.stringify(newUserTokens));
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
    verifyTokens = (user_unique_id) => {

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
            let userTokens: any = StorageManager.get(tokensKey);
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
                    ...StorageManager.get(tokensKey),
                    user_unique_id: this.realUuid
                };
                StorageManager.set(tokensKey, JSON.stringify(newUserTokens));
                // 非主流场景，一个用户换了个号码
                // 这时我们有了真实的 web_id，有了真实的 uuid，拿到真实的 ssid 即可
                this.requestSsid();
            }
        }
    };
    requestSsid = () => {
        const tokensKey = this.tokensKey;
        const userTokens: any = StorageManager.get(tokensKey);
        wx.request({
            url: `${REPORT_PREFIX}/v1/user/ssid`,
            method: 'POST',
            data: {
                'app_id': this.appId,
                'web_id': userTokens.web_id,
                'user_unique_id': `${userTokens.user_unique_id}`
            },
            success: (res) => {
                this.unlock();
                const data = res.data;
                if (data.e !== 0) {
                    console.error("请求 ssid 失败~");
                }
                else {
                    this.envInfo.user.ssid = data.ssid;
                    const newUserToken = {
                        ...userTokens,
                        ssid: data.ssid
                    };
                    StorageManager.set(tokensKey, JSON.stringify(newUserToken));
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
