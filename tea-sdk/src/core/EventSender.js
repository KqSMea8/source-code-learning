import logger from '../helper/logger';
import postSdkLog from '../helper/postSdkLog';
import request from '../helper/request';
import { ERROR_CODE } from '../configs/constants';

export default class EventSender {
  constructor(options) {
    this.logger = options.logger || logger;
    this.isSdkOnLoadEventReady = false;
    this.isSdkMonitorDisabled = false; // 只禁止onload事件。onerror事件待定，或许等后端就绪了也可以一起禁止。
  }

  send=({
    url, data, success, fail, eventError, notSure, isUnload,
  }) => {

    request({
      url,
      data,
      // image的callback时，三个参数都是undefined。
      success: (url, eventData, responseText) => {
        success();
        try {
          const res = JSON.parse(responseText);
          const errorCode = res.e;
          // 事件格式错误。
          if (errorCode !== 0) {
            let errorMsg = '未知错误';
            if (errorCode === -2) {
              errorMsg = '事件格式错误！请检查字段类型是否正确。';
            }

            this.logger.error('数据上报失败！', `错误码：${errorCode}。错误信息：${errorMsg}`);
            // logger.error('为了避免后续上报数据被阻塞，sdk 将不再重试上报本数据，数据实体将会从 localstorage 清除');
            eventError(eventData, errorCode);
            sdkMonitorOnError(url, eventData, errorCode);
          }
        } catch (e) {
          // 解析json失败。表明后端返回的格式有问题。
          sdkMonitorOnError(url, eventData, ERROR_CODE.RESPONSE_DATA_ERROR);
        }
      },
      fail: (url, eventData, errorCode) => {
        this.logger.error('数据上报失败！', `错误码：${errorCode}`);
        fail(eventData, errorCode);
        sdkMonitorOnError(url, eventData, errorCode);
      },
      notSure,
      isUnload,
    });

    // sdk on_load 事件
    if (!this.isSdkMonitorDisabled && !this.isSdkOnLoadEventReady) {
      this.isSdkOnLoadEventReady = true;
      try {
        const header = data[0].header;
        const user = data[0].user;

        sdkMonitorOnload(url, {
          app_id: header.app_id,
          app_name: header.app_name,
          sdk_version: header.sdk_version,
          web_id: user.web_id,
        });
      } catch (e) {
        // 跟业务方无关，所以不必输出。
        // this.logger.error('sdk onload 事件失败', e.message);
      }
    }
  }
}

const sdkMonitorOnload = (url, opts) => {
  try {
    const event = {
      event: 'onload',
      params: JSON.stringify({
        app_id: opts.app_id,
        app_name: opts.app_name || '',
        sdk_version: opts.sdk_version,
      }),
      local_time_ms: Date.now(),
    };
    const errData = {
      events: [event],
      user: {
        user_unique_id: opts.web_id, // 随意有个值就好
      },
      header: {
        app_id: 1338,
      },
    };
    setTimeout(() => {
      postSdkLog(url, [errData]);
    }, 16);
  } catch (e) {
    // logger.error('postOnloadLog: ', e.message);
  }
};

/**
 *
 * @param {string} url SDK上报的url
 * @param {*} data 上报的事件数据
 * @param {*} code 错误码
 */
const sdkMonitorOnError = (url, data, code) => {
  try {
    // 拍平 events，因为每一个都没有发成功，最多有25个事件
    const user = data[0].user;
    const header = data[0].header;
    const flatEvents = [];
    data.forEach((item) => {
      item.events.forEach((event) => {
        flatEvents.push(event);
      });
    });
    const errEvents = flatEvents.map(event => ({
      event: 'on_error',
      params: JSON.stringify({
        error_code: code,
        app_id: header.app_id,
        app_name: header.app_name || '',
        error_event: event.event,
        local_time_ms: event.local_time_ms,
        tea_event_index: Date.now(),
        params: event.params, // string
        header: JSON.stringify(header),
        user: JSON.stringify(user),
      }),
      local_time_ms: Date.now(),
    }));
    const errData = {
      events: errEvents,
      user: {
        user_unique_id: user.user_unique_id,
      },
      header: {
        app_id: 1338,
      },
    };
    setTimeout(() => {
      postSdkLog(url, [errData]);
    }, 16);
  } catch (e) {
    // logger.error('postErrLog: ', e.message);
  }
};
