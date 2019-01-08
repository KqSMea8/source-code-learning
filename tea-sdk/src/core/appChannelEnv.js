/**
 * 上报相关配置信息的处理与存储。
 */

import Env from './env';
import browser from '../helper/clientDetect';
import StorageClient from './storageClient/index'; // 用于存取token。
import { Logger } from '../helper/logger';
import fetch from '../helper/fetchTokens';
import { TEA_CACHE_PREFIX } from '../configs/constants';
import clientEnvManager from './clientEnv';
import type from '../utils/type';
import decodeXXX from '../utils/crypto';
import generateWebid from '../utils/uuid';

const urlPrefix = {
  cn: '1fz22z22z1nz21z4mz4bz4bz1kz1az21z4az21z1lz21z21z1bz1iz4az1az1mz1k',
  sg:
    '1fz22z22z1nz21z4mz4bz4bz21z1ez18z1jz1gz49z1kz1az21z4az19z27z22z1cz1mz24z1cz20z21z1cz18z4az1az1mz1k',
  va:
    '1fz22z22z1nz21z4mz4bz4bz1kz18z1jz1gz24z18z49z1kz1az21z4az19z27z22z1cz1mz24z1cz20z21z1cz18z4az1az1mz1k',
};

const getCookie = (name) => {
  try {
    const matches = document.cookie.match(new RegExp(`(?:^|;)\\s*${name}=([^;]+)`));
    return decodeURIComponent(matches ? matches[1] : '');
  } catch (e) {
    return '';
  }
};

class AppChannelEnv extends Env {
  constructor() {
    super();
    this.evtParams = {};
    this.reportUrl = '';
    this.userTokensPrefix = '';
    this.isSsidDisabled = false; // 可以配置是否禁用ssid
    this.isWebidDisabled = false; // 可以配置是否禁用webid
    this.isSdkMonitorDisabled = false;

    this.debugMode = false; // 调试模式
    this.blackUuid = ['null', 'undefined', '0', '', 'None'];

    this.logger = () => {};
    this.storageClient = new StorageClient();
  }

  init = (options) => {
    const { app_id, channel, log, channel_domain, name } = options;

    if (typeof app_id !== 'number') {
      throw new Error('app_id 必须是一个数字，注意检查是否是以`string`的方式传入的？');
    }

    this.logger = new Logger(name);
    this.logger.init(log);

    this.initConfigs(options);
    this.initUrls(channel, channel_domain);
    this.setEnv('app_id', app_id);
  };
  initConfigs = ({ app_id, disable_ssid, disable_webid, disable_sdk_monitor }) => {
    this.app_id = app_id;
    this.evtDataCacheKey = `${TEA_CACHE_PREFIX}events_${app_id}`;
    if (disable_ssid) {
      this.logger.info('ssid已禁用，设置user_unique_id不会请求ssid接口。');
      this.isSsidDisabled = true;
    }
    if (disable_webid) {
      this.logger.info('webid服务已禁用，ssid同时被禁用。将本地生成webid。');
      this.isWebidDisabled = true;
      this.isSsidDisabled = true;
    }
    if (disable_sdk_monitor) {
      this.logger.info('SDK监控已禁用。');
      this.isSdkMonitorDisabled = true;
    }
  };
  initUrls = (channel, channel_domain) => {
    if (channel === 'internal') {
      this.logger.warn('channel 的值 internal 已被废弃，已自动改为 cn。');
      channel = 'cn'; // eslint-disable-line
    }
    if (!channel_domain && !urlPrefix[channel]) {
      throw new Error('channel 变量只能是 `cn`, `sg`,`va`');
    }

    // 优先取 costom_domain
    let reportDomain = channel_domain || decodeXXX(urlPrefix[channel]);
    // 去掉尾部的斜杠。
    reportDomain = reportDomain.replace(/\/+$/, '');
    this.reportUrl = `${reportDomain}/v1/list`;
    this.userTokensPrefix = `${reportDomain}`;
  };

  /**
   *  包一层，做一些数据处理
   *
   *  web_id 覆盖
   * @param key
   * @param value
   */
  setEnv = (key, value) => {
    if (key === 'app_id') {
      this.checkUserToken(value);
    }

    // 原则：通用无效值帮过滤，其他情况业务方自己对内容负责。
    // 只有主动设置uuid，才会请求ssid服务。
    if (key === 'user_unique_id') {
      // 无效值
      if (this.blackUuid.some(item => item === String(value))) {
        this.logger.warn('设置了无效的值 {user_unique_id："%s"}。该操作已忽略。', value);
        return;
      }
      this.verifyTokens(value);
    }

    // 用户设置的web_id的优先级最高。覆盖其他途径的web_id。
    // 考虑几种情况：
    // - config 这里先设置，则后续RequestWebId回来后，发现web_id已存在，则不再设置。
    // - RequestWebId先回来，
    //    a.若web_id与uuid相同，则认为没有设置过uuid。那么均覆盖。
    //    b.若不同，则认为uuid已经设置。那么只覆盖web_id。
    if (key === 'web_id') {
      if (!value) {
        return;
      }
      if (
        !this.envInfo.user.user_unique_id
        // eslint-disable-next-line
        || (this.envInfo.user.user_unique_id &&
          this.envInfo.user.user_unique_id === this.envInfo.user.web_id)
      ) {
        this.set('user_unique_id', value);
      }
    }

    this.set(key, value);
  };

  /**
   * 历史原因，之前是写到 cookie 中的，需要一个一个去找，迁移过来
   *
   */
  transferFromCookie = () => {
    const tokensCacheKey = this.tokensCacheKey;
    const webIdKey = 'tt_webid';
    const ssidKey = '__tea_sdk__ssid';
    const uuidKey = '__tea_sdk__user_unique_id';
    const web_id = getCookie(webIdKey);
    const ssid = getCookie(ssidKey);
    const user_unique_id = getCookie(uuidKey);
    if (type.isLowIE()) {
      // 只检测 webid 业务方种下的，跟我无关
      if (web_id) {
        const newUserTokens = {
          web_id,
          ssid: web_id,
          user_unique_id: web_id,
        };
        this.storageClient.setItem(tokensCacheKey, newUserTokens);
      }
      return false;
    }
    // 本来就是迁移，格式约定为最严格状态
    if (web_id && ssid && user_unique_id) {
      const newUserTokens = {
        web_id,
        ssid,
        user_unique_id,
      };
      this.storageClient.setItem(tokensCacheKey, newUserTokens);
    }
  };

  purifyBlackUuid = (originUserTokens = {}) => {
    // 如若，uuid在黑名单里，则重置状态。
    if (this.blackUuid.some(item => item === originUserTokens.user_unique_id)) {
      const userTokens = {};
      this.setUserTokens(userTokens);
      this.logger.warn(
        '检测到无效的用户标识，已重置用户状态。{user_unique_id: "%s"}',
        originUserTokens.user_unique_id,
      );
      return userTokens;
    }
    return originUserTokens;
  };

  getUserTokens = () => this.storageClient.getItem(this.tokensCacheKey) || {};
  setUserTokens = (tokens = {}) => this.storageClient.setItem(this.tokensCacheKey, tokens);

  checkUserToken = (app_id) => {
    const tokensCacheKey = `${TEA_CACHE_PREFIX}tokens_${app_id}`;
    this.tokensCacheKey = tokensCacheKey;
    this.transferFromCookie();
    const userTokens = this.purifyBlackUuid(this.getUserTokens());

    // 若已经有web_id和uuid了，则认为非初次登录。
    // ssid 非必须。所以不用检测ssid了。目前，默认为空字符串。
    if (userTokens.user_unique_id && userTokens.web_id) {
      this.envInfo.user.user_unique_id = userTokens.user_unique_id;
      this.envInfo.user.web_id = userTokens.web_id;
      this.envInfo.user.ssid = userTokens.ssid || '';
      this.logger.info('初始化已经检测到了 webid user_unique_id，一般情况下不需要再次验证 id 了');
      this.unlock();
    } else {
      this.requestWebId(app_id);
    }
  };

  saveTokenToStorage = (token) => {
    const { web_id, ssid, user_unique_id } = token;

    this.setUserTokens({
      web_id,
      ssid,
      user_unique_id,
    });
  };

  /**
   * 获取web_id和ssid。并用webid设置uuid。
   */
  requestWebId = () => {
    this.isRequestWebId = true;

    /**
     *
     * @param data {web_id, ssid, e}
     */
    const successCallback = (data) => {
      // !! 若业务方已经设置了web_id，则以业务方为准。
      const web_id = this.envInfo.user.web_id || data.web_id;
      const { ssid } = data;

      this.isRequestWebId = false;
      // 同步结果到envInfo 和 storage 中去
      this.envInfo.user.ssid = ssid;
      this.envInfo.user.web_id = web_id;
      /**
       * 对于匿名用户，其实有了一个完整的 webId，能上报了
       */
      this.envInfo.user.user_unique_id = web_id;
      this.saveTokenToStorage({
        web_id,
        ssid,
        user_unique_id: web_id,
      });
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
    };

    const getWebIdFromLocal = () => {
      successCallback({
        web_id: generateWebid(),
        ssid: '',
      });
    };

    const getWebIdFromServer = () => {
      const webIdUrl = `${this.userTokensPrefix}/v1/user/webid`;
      fetch(
        webIdUrl,
        {
          app_id: this.app_id,
          url: location.href,
          user_agent: browser.userAgent,
          referer: browser.referrer,
          user_unique_id: '',
        },
        (data) => {
          if (data.e !== 0) {
            this.logger.error('请求 webid 失败。请联系管理员。');
          } else {
            successCallback(data);
          }
        },
        () => {
          this.isRequestWebId = false;
          // todo 是否要用本地的顶一下？本地webid后续被传入ssid服务会不会有问题？
          this.logger.error('获取 webid 失败，数据将不会被上报');
        },
      );
    };

    if (this.isWebidDisabled) {
      getWebIdFromLocal();
    } else {
      getWebIdFromServer();
    }
  };

  /**
   * 若用户主动设置了uuid，重新根据uuid获取ssid。
   * 等待web_id请求完成后，判断是否需要继续请求ssid。
   * @param user_unique_id
   * @return {boolean}
   */
  verifyTokens = (user_unique_id) => {
    const tokensCacheKey = this.tokensCacheKey;
    this.waitForVerifyTokens = false;
    // 设置真正的 user_unique_id 到storage和内存
    this.realUuid = `${user_unique_id}`;

    if (this.isRequestWebId) {
      this.waitForVerifyTokens = true;
      this.logger.info('正在请求 webid，requestSsid 将会在前者请求完毕之后被调用');
      return false;
    }

    // 初始化校验 webid，或者 webid 获取已经完成
    const userTokens = this.getUserTokens();
    // 若uuid与传入的uuid相同，且已经有web_id和ssid。则认为ssid有效。
    // 若ssid为空，则会认为token不完整（因为可能上次的ssid请求挂掉了），然后尝试请求一次ssid。
    if (userTokens.user_unique_id === this.realUuid && userTokens.ssid && userTokens.web_id) {
      // ssid无需更新
      this.logger.info('传入的 user_id/user_unique_id 与 缓存中的完全一致，无需再次请求');
      this.unlock();
    } else {
      this.lock();
      this.envInfo.user.user_unique_id = this.realUuid;

      const newUserTokens = {
        ...this.getUserTokens(),
        user_unique_id: this.realUuid,
      };
      this.storageClient.setItem(tokensCacheKey, newUserTokens);
      // 非主流场景，一个用户换了个号码
      // 这时我们有了真实的 web_id，有了真实的 uuid，拿到真实的 ssid 即可
      if (type.isLowIE()) {
        this.unlock();
        return false;
      }
      if (this.isSsidDisabled) {
        this.unlock();
        if (this.callback) {
          this.callback();
        }
      } else {
        this.requestSsid();
      }
    }
  };
  requestSsid = () => {
    const userTokens = this.getUserTokens();
    const ssidUrl = `${this.userTokensPrefix}/v1/user/ssid`;
    fetch(
      ssidUrl,
      {
        app_id: this.app_id,
        web_id: userTokens.web_id,
        user_unique_id: `${userTokens.user_unique_id}`,
      },
      (data) => {
        this.unlock();
        if (data.e !== 0) {
          this.logger.error('请求 ssid 失败~');
        } else {
          this.envInfo.user.ssid = data.ssid;
          const newUserToken = {
            ...userTokens,
            ssid: data.ssid,
          };
          this.setUserTokens(newUserToken);
          this.logger.info(
            '根据 user_unique_id 更新 ssid 成功！注意：在这之前不应该有数据被发出去',
          );
          if (this.callback) {
            this.callback();
          }
        }
      },
      () => {
        this.unlock();
        this.logger.error('根据 user_unique_id 获取新 ssid 失败');
      },
    );
  };

  /**
   * public
   * 存储公共事件属性
   */
  setEvtParams = (opts) => {
    const localOpts = { ...opts };
    Object.keys(localOpts).forEach((key) => {
      this.evtParams[key] = localOpts[key];
    });
  };

  /**
   * 把原始的事件信息，分批次与header、user合并为一个完整的事件结构。
   *
   */
  mergeEnvToEvents = (rawEvents /* 原始事件数据 */) => {
    const channelEnv = this.mergeEnv();

    // 按照__disable_storage__的值分组。
    // [1,1,1,1,1,1,0,0,1,0,1]
    // -->> [[1,1,1,1,1],[1],[0,0],[1],[0],[1]]
    const batchRawEvents = [];
    let index = 0;
    let isPrevEventDisableStorage;
    rawEvents.forEach((event) => {
      const isDisableStorage = !!event.params.__disable_storage__;
      if (typeof isPrevEventDisableStorage === 'undefined') {
        isPrevEventDisableStorage = isDisableStorage;
      } else if (
        isDisableStorage !== isPrevEventDisableStorage
        || batchRawEvents[index].length >= 5
      ) {
        index += 1;
        isPrevEventDisableStorage = !isPrevEventDisableStorage;
      }
      batchRawEvents[index] = batchRawEvents[index] || [];
      batchRawEvents[index].push(event);
    });

    // 处理成完整的事件结构。
    const batchCockedEvents = batchRawEvents.map(eventArray => ({
      events: eventArray.map((item) => {
        const params = {
          ...this.evtParams,
          ...item.params,
        };
        delete params.__disable_storage__; // 删掉非设置的属性
        return {
          ...item,
          params: JSON.stringify(params),
        };
      }),
      user: channelEnv.user,
      header: channelEnv.header,
      verbose: this.debugMode ? 1 : undefined,
      __disable_storage__: eventArray[0].params.__disable_storage__,
    }));

    return batchCockedEvents;
  };

  mergeEnv = () => {
    const channelEnv = this.get();
    const clientEnv = clientEnvManager.get();
    const tmpUser = {
      ...channelEnv.user,
    };
    const tmpCustom = {
      ...clientEnv.header.headers.custom,
      ...channelEnv.header.headers.custom,
    };
    const tmpHeaders = {
      ...clientEnv.header.headers,
      ...channelEnv.header.headers,
      custom: tmpCustom,
    };
    const tmpHeader = {
      ...clientEnv.header,
      ...channelEnv.header,
    };
    const ret = {
      user: tmpUser,
      header: {
        ...tmpHeader,
        headers: JSON.stringify(tmpHeaders),
      },
    };
    return ret;
  };

  lock() {
    this.isUserTokensReady = false;
  }

  unlock() {
    this.isUserTokensReady = true;
  }
  enableDebugMode(isEnable) {
    this.debugMode = isEnable;
  }
}

export default AppChannelEnv;
