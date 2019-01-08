/**
 * 相当于是对channel的封装。
 */
import Channel from './appChannel';
import type from '../utils/type';
import { Logger } from '../helper/logger';

/**
 * event_index 作为事件的id。自增，要全局不相同。
 * 启动时搞一个基数，后续事件由此自增。
 */
const getEventIndex = (() => {
  let lastEventId = +Date.now() + Number(`${Math.random()}`.slice(2, 8));
  return () => {
    lastEventId += 1;
    return lastEventId;
  };
})();
const preprocessEvent = (rawEvent, params) => {
  const EVT_PREFIX_REG = /^event\./;
  // 修正event.config、event.init等情况。
  let event = rawEvent;
  if (EVT_PREFIX_REG.test(rawEvent)) {
    event = rawEvent.slice(6);
  }

  let localParams = params;
  if (!type.isObj(localParams)) {
    localParams = {};
  }
  localParams.event_index = getEventIndex();
  const evtData = {
    event,
    params: localParams,
    local_time_ms: +new Date(),
  };
  return evtData;
};

export default class Collector {
  static exportMethods = ['init', 'config', 'send', 'start', 'predefinePageView'];

  constructor(name) {
    this._isSendFuncCalled = false; // send方法是否被调用过。避免多次调用。
    this._autoSendPV = true;
    this.name = name;
    this.logger = new Logger(name);
  }

  init = (conf) => {
    if (!type.isObj(conf)) {
      throw new Error('init 的参数必须是Object类型');
    }
    this.logger.init(conf.log);
    this.channel = new Channel({
      ...conf,
      name: this.name,
    });
    // todo 这么个callback法，约定太多了。还是当参数传进去比较好。
    this.channel.callback = () => {
      if (this.callbackSend) {
        this.start();
      }
    };
  };
  config = (conf) => {
    if (!type.isObj(conf)) {
      this.logger.throw('config 参数必须是 {} 的格式');
    }
    if (conf.log) {
      this.logger.init(true);
      this.channel.enableDebugMode(true);
      conf.log = null;
    }
    const keys = Object.keys(conf);
    if (!keys.length) {
      return false;
    }
    for (const key of keys) {
      const val = conf[key];
      switch (key) {
        // 通用 eventParams， 单独设置，不合适合并到 env 中
        case 'evtParams':
          this.channel.setEvtParams(val);
          break;
        case 'disable_ssid':
          this.logger.deprecated(`(disable_ssid)请通过init函数来设置。`);
          if (val) {
            this.logger.info('ssid已禁用，设置user_unique_id不会请求ssid接口。');
            this.channel.isSsidDisabled = val;
          }
          break;
        case 'disable_auto_pv':
          if (val) {
            this.logger.info('已禁止默认上报predefine_pageview事件，需手动上报。');
            this._autoSendPV = false;
          }
          break;
        // 是否 staging 标识
        case '_staging_flag':
          if (`${val}` === '1') {
            this.logger.info('根据_staging_flag设置，数据将会上报到stag 表。');
          }
          this.channel.setEvtParams({
            _staging_flag: Number(val),
          });
          break;
        case 'reportErrorCallback':
          if (typeof val === 'function') {
            this.channel.reportErrorCallback = val;
          }
          break;
        default:
          this.channel.setEnv(key, val);
      }
    }
  };
  /**
   * 废弃的名字。用start代替。
   */
  send = () => {
    this.start();
  };
  /**
   * 跟send是一个东西。
   */
  start = () => {
    if (this.channel.isUserTokensReady) {
      if (this._isSendFuncCalled) {
        return;
      }
      this._isSendFuncCalled = true;

      this.logger.info('看到本提示，意味着用户信息已完全就绪，上报通道打开。用户标识如下：');
      this.logger.logJSON(this.channel.get().user);
      if (this._autoSendPV) {
        this.predefinePageView();
      }
      this.channel.setReady(true);
    } else {
      this.callbackSend = true;
    }
  };
  predefinePageView = (params = {}) => {
    const defaultPvParams = {
      title: document.title || location.pathname,
      url: location.href,
      url_path: location.pathname,
    };
    const mergedParams = { ...defaultPvParams, ...params };
    this.event('predefine_pageview', mergedParams, true);
  };
  /**
   * 1. (event,params)
   * 2. (
          ['anyevent',{ enter_from:"home" }],
          ['anyevent',{ enter_from:"home" }]
        )
   */
  event = (...args) => {
    const isLastParamBoolean = type.isBoolean(args[args.length - 1]);
    const highPriority = isLastParamBoolean ? args[args.length - 1] : false;
    const normalArgs = isLastParamBoolean ? args.slice(0, args.length - 1) : args;

    const [eventOrArray] = normalArgs;
    let eventsArray = [];
    if (!type.isArray(eventOrArray)) {
      eventsArray[0] = normalArgs;
    } else {
      eventsArray = normalArgs;
    }
    eventsArray = eventsArray.map(eventArray => preprocessEvent(...eventArray));

    this.channel.event(eventsArray, highPriority);
  };
}
