/**
 * 继承环境相关信息。
 * 发送事件相关逻辑
 *
 * 需注意case：
 * - 可能unload后仍停留在该页面。比如下载：location.href='xxx.apk'
 */

import AppChannelEnv from './appChannelEnv';
import StorageClient from './storageClient/index'; // 用于存取原始的事件名及其参数。
import EventsStorageManager from './EventsStorageManager'; // 用于存取原始的事件名及其参数。
import EventSender from './EventSender';
import uuid from '../utils/uuid';

class AppChannel extends AppChannelEnv {
  constructor(options) {
    super();

    const { log, disable_storage, max_batch_num = 5, batch_time = 30 } = options;
    this.init(options);
    this.maxBatchNum = max_batch_num;
    this.waitForBatchTime = batch_time; // ms
    this.isReady = false;
    this.addListener();
    this.enableDebugMode(!!log);

    this.memoryCacheManager = new StorageClient(true);
    this.eventStorage = new EventsStorageManager({
      disable_storage,
    });
    this.eventStorage.setStorageKey(this.evtDataCacheKey); // this.init里已经设置。

    this.eventSender = new EventSender({
      logger: this.logger,
    });
    this.reportErrorCallback = () => {}; // todo 改为优雅的实现方式。
  }

  addListener = () => {
    // 为了确保兼容性，保留unload和beforeunload。
    // Safari Desktop下直接关闭页面，不会触发visiblchange
    window.addEventListener(
      'unload',
      () => {
        this.report(true);
      },
      false,
    );
    window.addEventListener(
      'beforeunload',
      () => {
        this.report(true);
      },
      false,
    );
    // https://www.igvita.com/2015/11/20/dont-lose-user-and-app-state-use-page-visibility/
    // http://output.jsbin.com/zubiyid/latest/quiet
    // https://www.google-analytics.com/analytics.js
    // 不再使用unload和beforeunload。是因为很多场景下并不会触发这两个事件。
    // beforunload时页面依旧可见，所以也可能有事件持续发生。
    // unload时虽然页面不可见了，但是有些场景（移动端）下不会触发，详见上方链接。
    // visibilitychange基本可以满足需求。页面不可见、触发场景多。ga也是如此。
    document.addEventListener(
      'visibilitychange',
      () => {
        if (document.visibilityState === 'hidden') {
          this.report(true);
        }
      },
      false,
    );
  };

  /**
   * sdk 初始化完毕，上报一次。
   */
  setReady = (bool) => {
    this.isReady = bool;
    this.eventSender.isSdkMonitorDisabled = this.isSdkMonitorDisabled;

    // 检查发送缓存的旧事件
    this.checkAndSendCachedStorageEvents();
    // 上报新事件
    this.report();
  };

  eventReportTimer = null;
  /**
   * 用户激活了一个事件。
   * 把该事件缓存下来。然后通知上报。
   * @evtData 事件
   * @highPriority 是否高优先级
   */
  event = (evtData = [], highPriority = false) => {
    const cache = this.memoryCacheManager.getItem(this.evtDataCacheKey) || [];
    const newCache = highPriority ? [...evtData, ...cache] : [...cache, ...evtData];
    this.memoryCacheManager.setItem(this.evtDataCacheKey, newCache);

    if (newCache.length >= 5) {
      this.report();
    } else {
      // debounce,
      if (this.eventReportTimer) {
        clearTimeout(this.eventReportTimer);
      }
      this.eventReportTimer = setTimeout(() => {
        this.report();
        this.eventReportTimer = null;
      }, this.waitForBatchTime);
    }
  };
  /**
   * 整理事件，合并成最终的事件格式，并判断是否发送，以及发送的条数。
   * @returns {boolean}
   * 可以用 localstorage 的 event 事件来彻底解耦的?
   * https://developer.mozilla.org/en-US/docs/Web/Events/storage
   */
  report = (isUnload = false) => {
    // 用户信息未就绪，绝对不能处理数据，否则一定是脏数据!
    if (!this.isUserTokensReady) {
      return false;
    }
    // 业务方配置没就绪，一定不要触发发送逻辑
    if (!this.isReady) {
      return false;
    }

    // 取出rawEvent，合并整理为完整事件。
    const rawEventData = this.memoryCacheManager.getItem(this.evtDataCacheKey) || [];
    this.memoryCacheManager.removeItem(this.evtDataCacheKey);
    const batchCockedEvents = this.mergeEnvToEvents(rawEventData);

    this.sendData(batchCockedEvents, isUnload);
  };

  /**
   * 将事件分批次，并存储、发送。
   */
  sendData = (batchCockedEvents, isUnload) => {
    // 按照__disable_storage__的值分组。
    // [1,1,1,1,1,1,0,0,1,0,1]
    // -->> [[1,1,1,1,1],[1],[0,0],[1],[0],[1]]
    const batchEvents = [];
    let index = 0;
    let isPrevEventDisableStorage;
    batchCockedEvents.forEach((event) => {
      const isDisableStorage = !!event.__disable_storage__;
      if (typeof isPrevEventDisableStorage === 'undefined') {
        isPrevEventDisableStorage = isDisableStorage;
      } else if (isDisableStorage !== isPrevEventDisableStorage || batchEvents[index].length >= 5) {
        index += 1;
        isPrevEventDisableStorage = !isPrevEventDisableStorage;
      }
      batchEvents[index] = batchEvents[index] || [];
      batchEvents[index].push(event);
    });

    // 生成发送id，每个id对应一个发送的数据。
    // 用于成功后删除对应id的缓存数据。
    batchEvents.forEach((event) => {
      const ajaxId = uuid();
      // 禁用缓存的事件 不缓存。
      if (!event[0].__disable_storage__) {
        this.eventStorage.add(ajaxId, event);
        // console.log('storage: ', ajaxId, event);
      } else {
        // console.log('skip storage: ', ajaxId, event);
      }
      this._sendData(ajaxId, event, isUnload);
    });
  };

  /**
   * 取出上次缓存未发送的数据，并发送。
   */
  checkAndSendCachedStorageEvents = () => {
    const data = this.eventStorage.getData();
    const sendIds = Object.keys(data);
    if (sendIds.length > 0) {
      sendIds.forEach((id) => {
        // console.log('send Old storage', id, data[id]);
        this._sendData(id, data[id]);
      });
    }
  };
  /**
   * 调用接口发送事件。
   */
  _sendData = (ajaxId, data, isUnload) => {
    // 开始上报数据，设置标识位，当前上报动作结束之前，不允许上报！
    this.isReporting = true;
    const resetReportStatus = () => {
      this.isReporting = false;
    };

    this.eventSender.send({
      url: this.reportUrl,
      data,
      success: () => {
        resetReportStatus();
        this.sendDataSuccess(ajaxId);
      },
      fail: (eventData, errorCode) => {
        // 成功、失败，都必须标明本次的动作完成
        resetReportStatus();
        this.reportErrorCallback(eventData, errorCode);
        // // 失败之后，隔3s 尝试一次
        setTimeout(() => {
          this.report();
        }, 3000);
      },
      eventError: (eventData, errorCode) => {
        this.reportErrorCallback(eventData, errorCode);
      },
      notSure: resetReportStatus,
      isUnload,
    });
  };
  /**
   * 发送成功后的回调。
   * 清理上报完成的事件数据。并触发一次事件上报。
   */
  sendDataSuccess = (ajaxId) => {
    // console.log('delete storage', ajaxId);
    this.eventStorage.delete(ajaxId);
    // 检查 mCache，如果有数据，立即上报
    this.report();
  };
}

export default AppChannel;
