import CollectorAsync from './CollectorAsync';
import type from '../utils/type';

const instanceMap = {};
const instanceCmdMap = {};
const getInstance = (name) => {
  if (!instanceMap[name]) {
    instanceMap[name] = new CollectorAsync(name);
  }
  return instanceMap[name];
};
const getInstanceCmdArray = (name) => {
  if (!instanceCmdMap[name]) {
    instanceCmdMap[name] = [];
  }
  return instanceCmdMap[name];
};

const processCmdArray = (cmdArray) => {
  const [cmdOrEventName, cmdArgs] = cmdArray;
  const cmdPartsArr = cmdOrEventName.split('.');

  if (cmdPartsArr.length === 1) {
    // config

    getInstanceCmdArray('default').push([cmdOrEventName, cmdArgs]);
  } else if (cmdPartsArr.length === 2) {
    // 限制instanceName不能为event。
    if (cmdPartsArr[0] === 'event') {
      // event.config

      getInstanceCmdArray('default').push([cmdOrEventName, cmdArgs]);
    } else {
      // feedback.config

      getInstanceCmdArray(cmdPartsArr[0]).push([cmdPartsArr[1], cmdArgs]);
    }
  } else if (cmdPartsArr.length === 3) {
    // 肯定是类似 feedback.event.config 这样的命令

    const instanceName = cmdPartsArr[0];
    const eventName = [cmdPartsArr[1], cmdPartsArr[2]].join('.');
    getInstanceCmdArray(instanceName).push([eventName, cmdArgs]);
  }
};
const execInstanceCmds = (instanceName, cmdArray) => {
  cmdArray.forEach((cmd) => {
    getInstance(instanceName)(...cmd);
  });
};

const processGlobalCmdQueueCache = () => {
  defaultCollectorClient.q.forEach((cmdArgumentsObj) => {
    const cmdArray = [].slice.call(cmdArgumentsObj);
    // 批处理命令
    if (type.isArray(cmdArray[0])) {
      cmdArray.forEach((batchCmdArray) => {
        processCmdArray(batchCmdArray);
      });
    } else {
      processCmdArray(cmdArray);
    }
  });

  Object.keys(instanceCmdMap).forEach((name) => {
    execInstanceCmds(name, instanceCmdMap[name]);
    instanceCmdMap[name] = [];
  });
  defaultCollectorClient.q = [];
};

/**
 * 异步引入，则应该移交并替换SDK的client。
 * 否则，不应该向全局注入变量。
 * @param newClient
 */
const transferAsyncCollector = (newClient) => {
  const nameSpace = window.TeaAnalyticsObject; // 通常来说就是字符串'collectEvent'
  // 没有，则认为非异步引入
  if (!nameSpace) {
    return;
  }
  if (!window[nameSpace]) {
    throw new Error('async setup code error!');
  }
  // window['collectEvent']通常是一个函数 _collect
  const oldClient = window[nameSpace];
  newClient.q = oldClient.q || [];
  newClient.l = oldClient.l || +new Date();
  window[nameSpace] = newClient; // 替换 window['collectEvent']
};

/** main */
const defaultCollectorClient = (...args) => {
  defaultCollectorClient.q.push(args);
  processGlobalCmdQueueCache();
};
defaultCollectorClient.q = [];
defaultCollectorClient.l = +new Date();

// debug use
defaultCollectorClient._instanceMap = instanceMap;
defaultCollectorClient._instanceCmdMap = instanceCmdMap;

// 支持方法式调用。
defaultCollectorClient.init = defaultCollectorClient.bind(null, 'init');
defaultCollectorClient.config = defaultCollectorClient.bind(null, 'config');
defaultCollectorClient.send = defaultCollectorClient.bind(null, 'send');
defaultCollectorClient.start = defaultCollectorClient.bind(null, 'start');
defaultCollectorClient.predefinePageView = defaultCollectorClient.bind(null, 'predefinePageView');

transferAsyncCollector(defaultCollectorClient);
processGlobalCmdQueueCache();

export default defaultCollectorClient;
