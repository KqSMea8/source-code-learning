'use strict';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

var TEA_CACHE_PREFIX = "__tea_cache_";
var REPORT_PREFIX = "https://mcs.snssdk.com";

var Logger = /** @class */function () {
    function Logger() {
        var _this = this;
        this.init = function (bool) {
            _this.isLog = bool;
        };
        this.info = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (_this.isLog) {
                console.log.apply(console, ["tea-miniProduct-sdk: "].concat(args));
            }
        };
        this.error = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (_this.isLog) {
                console.log(" ");
                console.error.apply(console, ["tea-miniProduct-sdk: "].concat(args));
                console.log(" ");
            }
        };
        this.warn = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (_this.isLog) {
                console.warn.apply(console, ["tea-miniProduct-sdk: "].concat(args));
            }
        };
        this.isLog = false;
    }
    return Logger;
}();
var logger = new Logger();

var storage = require('@system.storage');
var StorageCache = /** @class */function () {
    function StorageCache() {
        this.get = function (key) {
            return new Promise(function (resolve, reject) {
                storage.get({
                    key: key,
                    success: function success(value) {
                        // logger.info('storage GET :%s', value)
                        if (value) {
                            value = JSON.parse(value);
                        }
                        resolve(value);
                    },
                    fail: function fail(data, code) {
                        logger.error("handling fail, code = " + code);
                        reject({
                            data: data, code: code
                        });
                    }
                });
            });
        };
        this.set = function (key, value) {
            return new Promise(function (resolve, reject) {
                storage.set({
                    key: key,
                    value: value,
                    success: function success(data) {
                        // logger.info('storage SET :%s -- %s ', key, value)
                        resolve();
                    },
                    fail: function fail(data, code) {
                        logger.error("handling fail, code = " + code);
                        reject();
                    }
                });
            });
        };
    }
    return StorageCache;
}();
var StorageManager = new StorageCache();

//https://stackoverflow.com/questions/31173738/typescript-getting-error-ts2304-cannot-find-name-require
var fetch = require('@system.fetch');
var device = require('@system.device');
var network = require('@system.network');
var undef = undefined;
var Env = /** @class */function () {
    function Env() {
        var _this = this;
        this.initDeviceInfo = function () {
            var that = _this;
            // https://doc.quickapp.cn/features/system/device.html
            if (device && device.getInfo) {
                device.getInfo({
                    success: function success(res) {
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
                        that.set('resolution', res.screenWidth + "x" + res.screenHeight); //屏幕分辨率
                        that.set('screen_width', res.screenWidth); //屏幕高度
                        that.set('screen_height', res.screenHeight); //屏幕高度
                    }
                });
            }
            if (network && network.getType) {
                network.getType({
                    success: function success(data) {
                        // 返回网络类型, 有效值：
                        // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
                        that.set('network_type', data.type);
                        // 是否按照流量计费
                        that.set('network_metered', data.metered);
                    }
                });
            }
        };
        /**
         * @param appId
         * 这个动作非常早！
         */
        this.checkUserToken = function (appId) {
            return __awaiter(_this, void 0, void 0, function () {
                var tokensKey, userTokens;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.appId = appId;
                            tokensKey = TEA_CACHE_PREFIX + "tokens_" + appId;
                            this.tokensKey = tokensKey;
                            return [4 /*yield*/, StorageManager.get(tokensKey)];
                        case 1:
                            userTokens = _a.sent();
                            if (userTokens && userTokens.user_unique_id && userTokens.web_id && userTokens.ssid) {
                                this.envInfo.user.user_unique_id = userTokens.user_unique_id;
                                this.envInfo.user.web_id = userTokens.web_id;
                                this.envInfo.user.ssid = userTokens.ssid;
                                console.warn("初始化已经检测到了 webid ssid user_id，一般情况下不需要再次验证 id 了");
                                this.unlock();
                                return [2 /*return*/, false];
                            } else {
                                return [2 /*return*/, this.requestWebId(appId)];
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        this.requestWebId = function (appId) {
            return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    this.isRequestWebId = true;
                    fetch.fetch({
                        url: REPORT_PREFIX + "/v1/user/webid",
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
                        success: function success(res) {
                            return __awaiter(_this, void 0, void 0, function () {
                                var data, newUserTokens;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            data = JSON.parse(res.data);
                                            if (!(data.e !== 0)) return [3 /*break*/, 1];
                                            console.error("请求 webid 失败~");
                                            return [3 /*break*/, 3];
                                        case 1:
                                            this.isRequestWebId = false;
                                            // 同步结果到envInfo 和 storage 中去
                                            this.envInfo.user.ssid = data.ssid;
                                            this.envInfo.user.web_id = data.web_id;
                                            /**
                                             * 对于匿名用户，其实有了一个完整的 webId，能上报了
                                             */
                                            this.envInfo.user.user_unique_id = data.web_id;
                                            newUserTokens = {
                                                web_id: data.web_id,
                                                ssid: data.ssid,
                                                user_unique_id: data.web_id
                                            };
                                            return [4 /*yield*/, StorageManager.set(this.tokensKey, JSON.stringify(newUserTokens))];
                                        case 2:
                                            _a.sent();
                                            if (this.waitForVerifyTokens) {
                                                this.lock();
                                                this.verifyTokens(this.realUuid);
                                            } else {
                                                // config 中没有 userId（异步对同步，有则一定进入 if，不会到这里）
                                                // 试验了无数遍，没问题
                                                this.unlock();
                                                if (this.callback) {
                                                    this.callback();
                                                }
                                            }
                                            _a.label = 3;
                                        case 3:
                                            return [2 /*return*/];
                                    }
                                });
                            });
                        },
                        fail: function fail() {
                            _this.isRequestWebId = false;
                            console.error("获取 webid 失败，数据将不会被上报");
                        }
                    });
                    return [2 /*return*/];
                });
            });
        };
        this.verifyTokens = function (user_unique_id) {
            return __awaiter(_this, void 0, void 0, function () {
                var tokensKey, userTokens, newUserTokens;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            tokensKey = this.tokensKey;
                            this.waitForVerifyTokens = false;
                            // 设置真正的 user_unique_id 到storage和内存
                            this.realUuid = "" + user_unique_id;
                            if (!this.isRequestWebId) return [3 /*break*/, 1];
                            this.waitForVerifyTokens = true;
                            console.warn('正在请求 webid，requestSsid 将会在前者请求完毕之后被调用');
                            return [2 /*return*/, false];
                        case 1:
                            return [4 /*yield*/, StorageManager.get(tokensKey)];
                        case 2:
                            userTokens = _a.sent();
                            if (!(userTokens.user_unique_id === this.realUuid && userTokens.ssid && userTokens.web_id)) return [3 /*break*/, 3];
                            // ssid无需更新
                            console.warn("用户身份验证完毕：", JSON.stringify(userTokens, null, 2));
                            console.warn("传入的 user_id/user_unique_id 与 缓存中的完全一致，无需再次请求");
                            this.unlock();
                            return [3 /*break*/, 5];
                        case 3:
                            this.lock();
                            this.envInfo.user.user_unique_id = this.realUuid;
                            newUserTokens = __assign({}, userTokens, { user_unique_id: this.realUuid });
                            return [4 /*yield*/, StorageManager.set(tokensKey, JSON.stringify(newUserTokens))];
                        case 4:
                            _a.sent();
                            // 非主流场景，一个用户换了个号码
                            // 这时我们有了真实的 web_id，有了真实的 uuid，拿到真实的 ssid 即可
                            this.requestSsid();
                            _a.label = 5;
                        case 5:
                            return [2 /*return*/];
                    }
                });
            });
        };
        this.requestSsid = function () {
            return __awaiter(_this, void 0, void 0, function () {
                var tokensKey, userTokens;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            tokensKey = this.tokensKey;
                            return [4 /*yield*/, StorageManager.get(tokensKey)];
                        case 1:
                            userTokens = _a.sent();
                            fetch.fetch({
                                url: REPORT_PREFIX + "/v1/user/ssid",
                                method: 'POST',
                                data: JSON.stringify({
                                    'app_id': this.appId,
                                    'web_id': userTokens.web_id,
                                    'user_unique_id': "" + userTokens.user_unique_id
                                }),
                                header: {
                                    "Content-Type": 'application/json; charset=utf-8'
                                },
                                success: function success(res) {
                                    return __awaiter(_this, void 0, void 0, function () {
                                        var data, newUserToken;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    this.unlock();
                                                    data = JSON.parse(res.data);
                                                    if (!(data.e !== 0)) return [3 /*break*/, 1];
                                                    console.error("请求 ssid 失败~");
                                                    return [3 /*break*/, 3];
                                                case 1:
                                                    this.envInfo.user.ssid = data.ssid;
                                                    newUserToken = __assign({}, userTokens, { ssid: data.ssid });
                                                    return [4 /*yield*/, StorageManager.set(tokensKey, JSON.stringify(userTokens))];
                                                case 2:
                                                    _a.sent();
                                                    console.warn("根据 user_unique_id 更新 ssid 成功！注意：在这之前不应该有数据被发出去");
                                                    if (this.callback) {
                                                        this.callback();
                                                    }
                                                    _a.label = 3;
                                                case 3:
                                                    return [2 /*return*/];
                                            }
                                        });
                                    });
                                },
                                fail: function fail() {
                                    _this.unlock();
                                    logger.error("根据 user_unique_id 获取新 ssid 失败");
                                }
                            });
                            return [2 /*return*/];
                    }
                });
            });
        };
        // tea-web-sdk 的 env 分为了 default 和用户设置两个部分，上报的时候合并
        // 这里不这么搞，数据只有一份，覆盖就好！
        this.set = function (key, value) {
            if (key === 'os_version') {
                value = value + '';
            }
            if (key === "app_id") {
                _this.checkUserToken(value);
            }
            if (key === "user_unique_id") {
                _this.verifyTokens(value);
            }
            // 几乎都是 str，唯一一个 user_type 明确约定是 Number
            if (_this.envInfo.user.hasOwnProperty(key)) {
                if (key === 'user_type') {
                    value = Number(value);
                    _this.envInfo.user[key] = Number(value);
                } else if (key === 'user_id') {
                    _this.envInfo.user[key] = String(value);
                    _this.envInfo.user['user_unique_id'] = String(value);
                } else {
                    _this.envInfo.user[key] = String(value);
                }
            } else if (_this.envInfo.header.hasOwnProperty(key)) {
                _this.envInfo.header[key] = value;
            } else if (_this.envInfo.header.headers.hasOwnProperty(key)) {
                _this.envInfo.header.headers[key] = value;
            } else {
                _this.envInfo.header.headers.custom[key] = value;
            }
        };
        this.get = function () {
            var tmp = {
                user: {},
                header: {
                    headers: {
                        custom: {}
                    }
                }
            };
            var envInfo = _this.envInfo;
            // user copy
            var user = envInfo.user;
            var userKeys = Object.keys(user);
            for (var _i = 0, userKeys_1 = userKeys; _i < userKeys_1.length; _i++) {
                var item = userKeys_1[_i];
                if (user[item] !== undef) {
                    tmp.user[item] = user[item];
                }
            }
            //header copy;
            var header = envInfo.header;
            var headerKeys = Object.keys(header);
            for (var _a = 0, headerKeys_1 = headerKeys; _a < headerKeys_1.length; _a++) {
                var item = headerKeys_1[_a];
                if (header[item] !== undef && item !== 'headers') {
                    tmp.header[item] = header[item];
                }
            }
            // headers copy
            var headers = envInfo.header.headers;
            var headersKeys = Object.keys(headers);
            for (var _b = 0, headersKeys_1 = headersKeys; _b < headersKeys_1.length; _b++) {
                var item = headersKeys_1[_b];
                if (item !== 'custom' && headers[item] !== undef) {
                    tmp.header.headers[item] = headers[item];
                }
            }
            //custom copy!
            var custom = envInfo.header.headers.custom;
            var customKeys = Object.keys(custom);
            if (!customKeys.length) {
                delete tmp.header.headers.custom;
            } else {
                for (var _c = 0, customKeys_1 = customKeys; _c < customKeys_1.length; _c++) {
                    var item = customKeys_1[_c];
                    tmp.header.headers.custom[item] = custom[item];
                }
            }
            var ret = {
                user: tmp.user,
                header: __assign({}, tmp.header, { headers: JSON.stringify(tmp.header.headers) })
            };
            return ret;
        };
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
    Env.prototype.lock = function () {
        this.isUserTokensReady = false;
    };
    Env.prototype.unlock = function () {
        this.isUserTokensReady = true;
    };
    return Env;
}();
var env = new Env();

/**
 * Created by lingxufeng@bytedance.com from PGC-FE on 2018/2/27.
 */
var MemoryCache = /** @class */function () {
    function MemoryCache() {
        var _this = this;
        this.set = function (cacheKey, data) {
            _this.cache[cacheKey] = data;
        };
        this.get = function (cacheKey) {
            var ret = [];
            var cache = _this.cache[cacheKey];
            if (cache) {
                for (var _i = 0, cache_1 = cache; _i < cache_1.length; _i++) {
                    var item = cache_1[_i];
                    ret.push(item);
                }
            } else {
                ret = [];
            }
            return ret;
        };
        this.clean = function (cacheKey) {
            _this.cache[cacheKey] = undefined;
        };
        this.cache = {};
    }
    return MemoryCache;
}();
var mCacheManager = new MemoryCache();

var fetch$1 = require('@system.fetch');
var postData = function postData(payload, _success, _fail) {
    var sendRandom = +new Date() + Math.floor(Math.random() * 100000);
    fetch$1.fetch({
        url: "https://mcs.snssdk.com/v1/list?tea_sdk_random=" + sendRandom,
        data: payload,
        method: "POST",
        header: {
            "Content-Type": "text/plain"
        },
        success: function success(res) {
            var data = res.data;
            try {
                data = JSON.parse(data);
            } catch (e) {
                logger.error("response反序列化错误");
                _fail();
                return;
            }
            if (typeof data === "string") {
                logger.error("数据上报失败");
                _fail();
            } else {
                if (data.e === 0) {
                    logger.warn('数据上报成功: ', payload);
                } else {
                    logger.error('数据上报失败！', '\u9519\u8BEF\u7801\uFF1A' + data.e);
                    logger.error('为了避免后续上报数据被阻塞，sdk 将不再重试上报本数据，数据实体将会从 localstorage 清除');
                }
                _success();
            }
        },
        fail: function fail() {
            logger.error("数据上报失败");
            _fail();
        }
    });
};

// 设计原则：
// - 上报数据用队列的方式
// - 同一时间段只允许一条数据上报，这样才能维持队列`入队`、`出队`、`删除数据`的逻辑！
var Channel = /** @class */function () {
    function Channel() {
        var _this = this;
        this.setReady = function (bool) {
            _this.isReady = bool;
            _this.report();
        };
        this.setEvtParams = function (opts) {
            // 用户传递优先，按照时间顺序覆盖
            _this.evtParams = __assign({}, _this.evtParams, opts);
        };
        this.event = function (evtData) {
            var cacheKey = _this.cacheKey;
            var cache = mCacheManager.get(cacheKey) || [];
            cache.push(evtData);
            mCacheManager.set(cacheKey, cache);
            if (cache.length >= 5) {
                _this.report();
            } else {
                setTimeout(function () {
                    _this.report();
                }, 45);
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
        this.report = function () {
            return __awaiter(_this, void 0, void 0, function () {
                var cacheKey, mCacheData, curSendData, oldCacheData, newCacheData, len, actualSendLength, sliceData;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.isReady) {
                                return [2 /*return*/, false];
                            }
                            // 用户信息未就绪，绝对不能处理数据，否则一定是脏数据!
                            if (!env.isUserTokensReady) {
                                return [2 /*return*/, false];
                            }
                            cacheKey = this.cacheKey;
                            mCacheData = mCacheManager.get(cacheKey);
                            // 清除当前的内存缓存，因为这些数据注定要固化到 ls 中去了。
                            mCacheManager.clean(cacheKey);
                            curSendData = this.mergeEvts(mCacheData);
                            return [4 /*yield*/, StorageManager.get(cacheKey)];
                        case 1:
                            oldCacheData = _a.sent() || [];
                            newCacheData = curSendData.concat(oldCacheData);
                            // 合并完毕了之后，还是没有数据;
                            if (!newCacheData.length) {
                                return [2 /*return*/, false];
                            }
                            // 将要当前数据固话到ls 中，顺带也把ls 中的旧数据给`覆盖了`（见wx API 文档）
                            this.setSCcacheData(newCacheData);
                            // 当前正在上报数据，只能返回，不可能同时发送 n 条数据，会增加维护队列的成本
                            if (this.isReporting) {
                                return [2 /*return*/, false];
                            } else {
                                len = newCacheData.length;
                                if (!len) {
                                    return [2 /*return*/, false];
                                }
                                actualSendLength = 0;
                                sliceData = null;
                                if (len <= this.sliceLength) {
                                    actualSendLength = len;
                                    sliceData = newCacheData;
                                } else {
                                    actualSendLength = this.sliceLength;
                                    // 队列头部的20条加入上报队列，但这里不可以用直接删；因为必须保证数据上报 ok，才能真正的删除数据！
                                    sliceData = newCacheData.slice(len - this.sliceLength);
                                }
                                this.sendData(sliceData, actualSendLength);
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        // delPos 等于20，或者小于20的某个常数；
        // 必须传递，因为队列的长度会变化，场景：
        // - 上报前是16条，把这16条都上报了，常理上说上报结束之后清空即可；
        // - 上报期间，陆续有5条数据进入 ls ，也就是说回调之前，队列内部其实有21条数据
        // - 如果没有 delPos，这里只能直接删除20条（其中有4条被误删了~）
        this.sendData = function (data, delPos) {
            // 开始上报数据，设置标识位，当前上报动作结束之前，不允许上报！
            _this.isReporting = true;
            var cacheKey = _this.cacheKey;
            postData(data, function () {
                return __awaiter(_this, void 0, void 0, function () {
                    var actualCacheData, actualCacheLength, remainCacheData;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                this.isReporting = false;
                                return [4 /*yield*/, StorageManager.get(cacheKey)];
                            case 1:
                                actualCacheData = _a.sent() || [];
                                actualCacheLength = actualCacheData.length;
                                remainCacheData = actualCacheData.slice(0, actualCacheLength - delPos);
                                StorageManager.set(cacheKey, JSON.stringify(remainCacheData));
                                // 检查 mCache，如果有数据，立即上报
                                this.report();
                                return [2 /*return*/];
                        }
                    });
                });
            }, function () {
                // 成功、失败，都必须标明本次的动作完成
                _this.isReporting = false;
                // // 失败之后，隔3s 尝试一次
                setTimeout(function () {
                    _this.report();
                }, 3000);
            });
        };
        this.setSCcacheData = function (data) {
            // 合并完毕之后再 set 回去
            // 后续确定上报 ok 之后，再清除该 item
            StorageManager.set(_this.cacheKey, JSON.stringify(data));
        };
        this.mergeEvts = function (arr /*原始事件数据*/) {
            if (!arr.length) {
                return [];
            }
            var mergedData = {
                events: [],
                user: {},
                header: {}
            };
            var evtParams = _this.evtParams;
            var evtParamsKeys = Object.keys(evtParams);
            // 逐个检查，把evtParams加上（注意用户设置优先）
            for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
                var evt = arr_1[_i];
                for (var _a = 0, evtParamsKeys_1 = evtParamsKeys; _a < evtParamsKeys_1.length; _a++) {
                    var evtParamsKey = evtParamsKeys_1[_a];
                    // 根本没有上报，排除0、false、''
                    if (evt.params[evtParamsKey] === undefined) {
                        evt.params[evtParamsKey] = evtParams[evtParamsKey];
                    }
                }
                var params = JSON.stringify(evt.params);
                evt.params = params;
            }
            mergedData.events = arr;
            var envData = env.get();
            mergedData.events = arr;
            mergedData.user = envData.user;
            mergedData.header = envData.header;
            return [mergedData];
        };
        this.isReady = false;
        this.isReporting = false;
        this.sliceLength = 10;
        this.cacheKey = TEA_CACHE_PREFIX + "events";
        this.evtParams = {};
    }
    return Channel;
}();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
var MiniProduct = /** @class */function () {
    function MiniProduct() {
        var _this = this;
        // 暴露 tea 的 config 信息给业务方
        this.getConfig = function () {
            return env.get();
        };
        /**
         * @param app_id
         * appId 步骤强行提前，因为设计到user_unique_id 的优先级问题
         */
        this.init = function (app_id) {
            if (typeof app_id !== 'number') {
                throw new Error('app_id must be a number');
            }
            env.initDeviceInfo(); // 调用了系统native方法，需要在onCreate之后调用。
            env.set('app_id', app_id);
        };
        this.config = function (conf) {
            // config 时停止上报，config 结束之后主动调用 send 才会开启上报;
            _this.channel.setReady(false);
            if ((typeof conf === 'undefined' ? 'undefined' : _typeof(conf)) !== 'object') {
                throw new Error('config param must be {}');
            }
            // 提前写
            if (conf.log) {
                logger.init(Boolean(conf.log));
                logger.info("logger 功能开启");
            }
            logger.info("当前配置项：", JSON.stringify(conf, null, 2));
            var keys = Object.keys(conf);
            if (!keys.length) {
                return false;
            }
            for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                var key = keys_1[_i];
                var val = conf[key];
                // 通用 eventParams
                if (key === "evtParams") {
                    _this.channel.setEvtParams(val);
                }
                // 是否到 starg 标识
                else if (key === "_staging_flag") {
                        if (val + '' === '1') {
                            logger.warn("根据_staging_flag设置，数据将会上报到stag 表。");
                        }
                        _this.channel.setEvtParams({
                            "_staging_flag": val
                        });
                    } else {
                        env.set(key, val);
                    }
            }
        };
        this.send = function () {
            if (env.isUserTokensReady) {
                logger.warn("看到本提示，意味着用户信息已完全就绪，上报通道打开");
                logger.info("用户信息", JSON.stringify(env.get().user, null, 2));
                _this.channel.setReady(true);
            } else {
                _this.callbackSend = true;
            }
        };
        this.event = function (event, params) {
            if (!params) {
                params = {};
            }
            if ((typeof params === 'undefined' ? 'undefined' : _typeof(params)) !== 'object') {
                logger.error("事件params 必须是{}:", "event(event: string, params: object)");
            }
            var evtData = {
                event: event,
                params: params,
                local_time_ms: +new Date()
            };
            _this.channel.event(evtData);
        };
        this.callbackSend = false;
        this.channel = new Channel();
        this.reportUrl = "https://mcs.snssdk.com";
        env.callback = function () {
            if (_this.callbackSend) {
                _this.send();
            }
        };
    }
    return MiniProduct;
}();
// 导出依然是单例，跟 main sdk 保持一致
var index = new MiniProduct();

module.exports = index;
