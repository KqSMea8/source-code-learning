declare const BK;
declare const setTimeout;
declare const console;
declare const localStorage;
declare const XMLHttpRequest;

export type TResponseData = {
  [key: string]: any;
};
export type TRequestArgs = {
  url: string;
  method: 'POST' | 'GET';
  headers: {
    [key: string]: string;
  };
  data: object | any[];
  success: (responseDataObj: TResponseData) => void;
  fail: () => void;
};
const requestAdapter = function(args: TRequestArgs) {
  if (!BK.isBrowser) {
    BK.Http.request({
      url: args.url,
      method: args.method,
      headers: args.headers,
      body: JSON.stringify(args.data),
      success: (succObj) => {
        try {
          const data = succObj.jsonObject(); // 取出返回的数据
          args.success(data);
        } catch (e) {
          args.fail();
        }
      },
      fail: () => {
        args.fail();
      },
    });
  } else if (XMLHttpRequest) {
    const xhr = new XMLHttpRequest();
    xhr.open(args.method, args.url, true);

    Object.keys(args.headers).forEach((key) => {
      xhr.setRequestHeader(key, args.headers[key]);
    });

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        args.success(data);
      } catch (e) {
        args.fail();
      }
    };
    xhr.onerror = (error) => {
      xhr.abort();
      args.fail();
    };
    xhr.send(JSON.stringify(args.data));
  }
};

const setTimeoutAdapter = function(func, time) {
  if (!BK.isBrowser) {
    BK.Director.ticker.setTimeout(func, time);
  } else if (setTimeout) {
    setTimeout(func, time);
  }
};

const consoleAdapter = {
  info(...args) {
    if (!BK.isBrowser) {
      BK.Console.log(...args);
    } else if (console && console.info) {
      console.info(...args);
    }
  },
  log(...args) {
    if (!BK.isBrowser) {
      BK.Console.log(...args);
    } else if (console && console.log) {
      console.log(...args);
    }
  },
  error(...args) {
    if (!BK.isBrowser) {
      BK.Console.error(...args);
    } else if (console && console.error) {
      console.error(...args);
    }
  },
  warn(...args) {
    if (!BK.isBrowser) {
      BK.Console.log(...args);
    } else if (console && console.warn) {
      console.warn(...args);
    }
  },
};

const localStorageAdapter = {
  setItem(key, value) {
    if (!BK.isBrowser) {
      return BK.localStorage.setItem(key, value);
    } else if (localStorage && localStorage.setItem) {
      return localStorage.setItem(key, value);
    }
  },
  getItem(key) {
    if (!BK.isBrowser) {
      return BK.localStorage.getItem(key);
    } else if (localStorage && localStorage.getItem) {
      return localStorage.getItem(key);
    }
  },
};

type TSetter = (key: string, value: string | number) => void;
const autoDetectEnvInfo = function (setter: TSetter) {
  if (!BK.isBrowser) {
    const systemInfo = BK.getSystemInfoSync();
    setter('os_version', systemInfo.osVersion); // 手机品牌
    setter('network_type', systemInfo.networkType);
    setter('os_name', systemInfo.platform); // 客户端平台
    setter('platform', 'qqplay'); // runtime平台类型

    setter('qq_ver', systemInfo.QQVer); // QQ 版本
  }
};

export default {
  request: requestAdapter,
  setTimeout: setTimeoutAdapter,
  console: consoleAdapter,
  localStorage: localStorageAdapter,
  autoDetectEnvInfo,
};
