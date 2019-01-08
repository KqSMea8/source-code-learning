/**
 * Created by lingxufeng@bytedance.com from PGC-FE on 2018/7/2.
 */

// import logger from '../helper/logger';

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

const sendByImg = (url, data) => {
  try {
    const urlPrefix = url.split('v1')[0];
    data.forEach((item) => {
      const str = encodePayload(item);
      let img = new Image(1, 1);
      img.onload = () => {
        img = null;
      };
      img.onerror = () => {
        img = null;
      };
      img.src = `${urlPrefix}/v1/gif?${str}`;
    });
  } catch (e) {
    // logger.error(e.message);
  }
};

const postSdkLog = (url, data) => {
  if (window.XDomainRequest) {
    return sendByImg(url, data);
  }
  const xhr = new XMLHttpRequest();
  xhr.open('POST', `${url}?rdn=${Math.random()}`, true);
  xhr.onload = () => {
    try {
      // const res = JSON.parse(xhr.responseText);
      // logger.info('report sdk event success,', res);
    } catch (e) {
      // logger.error(e.message);
    }
  };
  xhr.onerror = () => {
    xhr.abort();
  };
  xhr.send(JSON.stringify(data));
};

export default postSdkLog;
