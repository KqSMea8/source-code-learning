// import logger from './logger';
/**
 * Created by lingxufeng@bytedance.com from PGC-FE on 2018/5/23.
 */
const fetchTokens = (url, payload, success, fail) => {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
  xhr.onload = () => {
    try {
      const resData = JSON.parse(xhr.responseText);
      if (success) {
        success(resData);
      }
    } catch (e) {
      // logger.error(e.message);
      if (fail) {
        fail();
      }
    }
  };
  xhr.onerror = () => {
    if (fail) {
      fail();
    }
  };
  xhr.send(JSON.stringify(payload));
};

export default fetchTokens;
