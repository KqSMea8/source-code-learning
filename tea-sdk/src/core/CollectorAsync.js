/**
 * 封装原始的Collector对象。支持异步的调用方式；处理异步的命令队列。
 * - 支持处理传入的命令队列
 * - 兼容init非第一个命令的调用顺序。
 * - 支持命令队式调用 collect('init', {})
 * - 封装命令式调用，以支持方法式调用 collect.init({})
 */
import Collector from './Collector';

export default class CollectorAsync {
  constructor(name) {
    this.name = name || `Collector${+new Date()}`;
    this.cmdQueue = [];
    this.colloctor = new Collector(this.name);
    this._isQueueProcessed = false;

    this._processCmdQueue();

    // 绑定同步的调用方式。
    this._exportCollect.init = this._exportCollect.bind(this, 'init');
    this._exportCollect.config = this._exportCollect.bind(this, 'config');
    this._exportCollect.send = this._exportCollect.bind(this, 'send');
    this._exportCollect.start = this._exportCollect.bind(this, 'start');
    this._exportCollect.predefinePageView = this._exportCollect.bind(this, 'predefinePageView');

    return this._exportCollect;
  }
  /**
   * 实例化后返回的函数。
   * - 作为api调用的载体。
   */
  _exportCollect = (...argsArray) => {
    if (this._isQueueProcessed) {
      this._executeCmd(...argsArray);
      return;
    }
    this.cmdQueue.push(argsArray);
    this._processCmdQueue();
  };
  /**
   * 处理命令队列。
   * - 等待init命令出现后，才真正处理队列。
   */
  _processCmdQueue = () => {
    if (this.cmdQueue.length === 0) {
      return;
    }
    const findIndex = (array, val, key) => {
      let itemIndex = -1;
      array.forEach((i, index) => {
        const value = typeof key !== 'undefined' ? i[key] : i;
        if (value === val) {
          itemIndex = index;
        }
      });
      return itemIndex;
    };
    const initCmdIndex = findIndex(this.cmdQueue, 'init', '0');
    if (initCmdIndex !== -1) {
      this._isQueueProcessed = true;
      // 优先执行init命令
      this._executeCmd(...this.cmdQueue[initCmdIndex]);
      this.cmdQueue.forEach((cmd, index) => {
        if (index !== initCmdIndex) {
          this._executeCmd(...cmd);
        }
      });
      this.cmdQueue = [];
    }
  };
  /**
   *  只可能是函数调用，或者是事件上报
   */
  _executeCmd = (...argsArray) => {
    const cmdOrEvent = argsArray[0];
    if (Collector.exportMethods.indexOf(cmdOrEvent) > -1) {
      this.colloctor[cmdOrEvent](...argsArray.slice(1));
    } else {
      this.colloctor.event(...argsArray);
    }
  };
}
