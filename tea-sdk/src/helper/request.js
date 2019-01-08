import { ERROR_CODE } from '../configs/constants';
const encodePayload = (obj) => {
  let string = '';
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      string += `&${key}=${encodeURIComponent(JSON.stringify(obj[key]))}`;
    }
  }
  string = string[0] === '&' ? string.slice(1) : string;
  return string;
};

const sendByImg = (url, data, success, fail) => {
  try {
    const urlPrefix = url.split('v1')[0];
    if (!urlPrefix) {
      fail(url, data, ERROR_CODE.NO_URL_PREFIX);
      return;
    }
    data.forEach((item) => {
      const str = encodePayload(item);
      let img = new Image(1, 1);
      img.onload = () => {
        img = null;
        success();
      };
      img.onerror = () => {
        img = null;
        fail(url, data, ERROR_CODE.IMG_ON_ERROR);
      };
      img.src = `${urlPrefix}/v1/gif?${str}`;
    });
  } catch (e) {
    fail(url, data, ERROR_CODE.IMG_CATCH_ERROR, e.message);
  }
};

/**
 * 事件数据上报 + SDK Log上报
 * @param {*} url
 * @param {*} data
 * @param {*} success
 * @param {*} fail
 * @param {*} notSure
 * @param {*} isUnload 是否是由unload事件触发的。
 */
const request = ({ url, data, success, fail, notSure, isUnload }) => {
  const localData = data;
  // ie8/9只能走图片发送
  if (window.XDomainRequest) {
    sendByImg(url, localData, success, fail);
    return;
  }

  if (isUnload) {
    // sendBeacon: https://developer.mozilla.org/zh-CN/docs/Web/API/Navigator/sendBeacon
    if (window.navigator && window.navigator.sendBeacon) {
      notSure();
      // 无法拿到真正成功与否，就不调用回调清除数据了（后端允许重传）
      const status = window.navigator.sendBeacon(url, JSON.stringify(localData));
      // logger.info('beacon:', status);
      if (status) {
        success();
        // logger.info('beacon: success', status);
      } else {
        fail(url, data, ERROR_CODE.BEACON_STATUS_FALSE);
      }
      return;
    }

    sendByImg(url, localData, success, fail);
    return;
  }

  const xhr = new XMLHttpRequest();
  xhr.open('POST', `${url}?rdn=${Math.random()}`, true);
  xhr.onload = () => {
    success(url, localData, xhr.responseText);
  };
  xhr.onerror = () => {
    xhr.abort();
    fail(url, localData, ERROR_CODE.XHR_ON_ERROR);
  };
  xhr.send(JSON.stringify(localData));
};

export default request;
