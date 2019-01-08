import StorageClient from './storageClient/index';
import types  from '../utils/type';
import uuid  from '../utils/uuid';

/**
 * 仅在第一次从缓存里读取数据。
 * 之后维护内存与localstorage的数据保持同步。这样仅保存即可，无需再读取。
 * 节省了读取的次数。优化性能。
 *
 * 发送时存储，之后在成功的回调里根据id删除对应的值。
 * 数据结构为：
 * {
 *  ajaxId:eventArray,
 *  ajaxId:eventArray,
 * }
 *
 * oldStorageStructure
 * eventArray = [{"events":[{"event":"predefine_pageview","params":"{\"_staging_flag\":0,\"user\":\"xuyingjun\",\"app_id\":6,\"app_name\":\"行为分析系统\",\"title\":\"转化分析 - 行为分析系统 - TEA\",\"url\":\"https://data.bytedance.net/tea/app/6/funnel-analysis\",\"url_path\":\"/tea/app/6/funnel-analysis\",\"is_spa\":1,\"page_from\":\"retentionAnalysis\",\"page_to\":\"funnelAnalysis\",\"event_index\":1541481053598}","local_time_ms":1541480426097},{"event":"page_open","params":"{\"_staging_flag\":0,\"user\":\"xuyingjun\",\"app_id\":6,\"app_name\":\"行为分析系统\",\"page_from\":\"retentionAnalysis\",\"page_to\":\"funnelAnalysis\",\"event_index\":1541481053599}","local_time_ms":1541480426097}],"user":{"user_unique_id":"xuyingjun","web_id":"6616175884537021956","ssid":"510f6a51-2811-45d5-a675-8eaefce76e32"},"header":{"headers":"{\"custom\":{\"screen_width\":1280,\"screen_height\":800}}","os_name":"mac","os_version":"10_14_0","device_model":"mac","language":"zh-CN","platform":"web","sdk_version":"3.2.1","timezone":8,"tz_offset":-28800,"resolution":"1280x800","browser":"Chrome","browser_version":"69.0.3497.100","referrer":"","referrer_host":"data.bytedance.net","app_id":15001}},{"events":[{"event":"predefine_pageview","params":"{\"_staging_flag\":0,\"user\":\"xuyingjun\",\"app_id\":6,\"app_name\":\"行为分析系统\",\"title\":\"留存分析 - 行为分析系统 - TEA\",\"url\":\"https://data.bytedance.net/tea/app/6/retention-analysis\",\"url_path\":\"/tea/app/6/retention-analysis\",\"is_spa\":1,\"page_from\":\"eventAnalysis\",\"page_to\":\"retentionAnalysis\",\"event_index\":1541481053596}","local_time_ms":1541480424006},{"event":"page_open","params":"{\"_staging_flag\":0,\"user\":\"xuyingjun\",\"app_id\":6,\"app_name\":\"行为分析系统\",\"page_from\":\"eventAnalysis\",\"page_to\":\"retentionAnalysis\",\"event_index\":1541481053597}","local_time_ms":1541480424006}],"user":{"user_unique_id":"xuyingjun","web_id":"6616175884537021956","ssid":"510f6a51-2811-45d5-a675-8eaefce76e32"},"header":{"headers":"{\"custom\":{\"screen_width\":1280,\"screen_height\":800}}","os_name":"mac","os_version":"10_14_0","device_model":"mac","language":"zh-CN","platform":"web","sdk_version":"3.2.1","timezone":8,"tz_offset":-28800,"resolution":"1280x800","browser":"Chrome","browser_version":"69.0.3497.100","referrer":"","referrer_host":"data.bytedance.net","app_id":15001}},{"events":[{"event":"predefine_pageview","params":"{\"_staging_flag\":0,\"user\":\"xuyingjun\",\"app_id\":6,\"app_name\":\"行为分析系统\",\"title\":\"事件分析 - 行为分析系统 - TEA\",\"url\":\"https://data.bytedance.net/tea/app/6/event-analysis\",\"url_path\":\"/tea/app/6/event-analysis\",\"is_spa\":1,\"page_from\":\"dashboard\",\"page_to\":\"eventAnalysis\",\"event_index\":1541481053594}","local_time_ms":1541480414943},{"event":"fe_web_stability","params":"{\"_staging_flag\":0,\"user\":\"xuyingjun\",\"app_id\":6,\"app_name\":\"行为分析系统\",\"url\":\"/tea/api/v1/6/attribute\",\"ajax_error_msg\":\"Network Error\",\"is_online\":\"no\",\"event_index\":1541481053592}","local_time_ms":1541480414796},{"event":"fe_analysis_result_show","params":"{\"_staging_flag\":0,\"user\":\"xuyingjun\",\"app_id\":6,\"app_name\":\"行为分析系统\",\"status\":\"other\",\"analysis_type\":\"event\",\"compute_time\":135,\"event_index\":1541481053593}","local_time_ms":1541480414862},{"event":"page_open","params":"{\"_staging_flag\":0,\"user\":\"xuyingjun\",\"app_id\":6,\"app_name\":\"行为分析系统\",\"page_from\":\"dashboard\",\"page_to\":\"eventAnalysis\",\"event_index\":1541481053595}","local_time_ms":1541480414943}],"user":{"user_unique_id":"xuyingjun","web_id":"6616175884537021956","ssid":"510f6a51-2811-45d5-a675-8eaefce76e32"},"header":{"headers":"{\"custom\":{\"screen_width\":1280,\"screen_height\":800}}","os_name":"mac","os_version":"10_14_0","device_model":"mac","language":"zh-CN","platform":"web","sdk_version":"3.2.1","timezone":8,"tz_offset":-28800,"resolution":"1280x800","browser":"Chrome","browser_version":"69.0.3497.100","referrer":"","referrer_host":"data.bytedance.net","app_id":15001}}]
 */
class EventStorageManager {
  constructor({ disable_storage = false }) {
    this._storage = new StorageClient(disable_storage);
    this._storageKey = '';
    this._data = undefined;
  }
  setStorageKey(key) {
    this._storageKey = key;
  }
  getAllEvents() {
    const storageObj = this.getData();
    Object.keys(storageObj).reduce(
      (prev, currKey) => prev.concat(storageObj[currKey] || []),
      [],
    );
  }
  getData() {
    this._checkIsDataInit();
    return this._data;
  }
  add(sendId, events = []) {
    this._checkIsDataInit();
    if (events.length !== 0) {
      this._data[sendId] = events;
      this._save();
    }
  }
  delete(sendId) {
    this._checkIsDataInit();
    if (this._data[sendId]) {
      delete this._data[sendId];
      this._save();
    }
  }
  _checkIsDataInit() {
    if (typeof this._data === 'undefined') {
      // 之前的结构是数组。现在是对象。
      try {
        const mayBeOldDataStructure = this._getDataFromStorage();
        if (types.isArray(mayBeOldDataStructure)) {
          this._data = {
            [uuid()]: mayBeOldDataStructure,
          };
          // 新结构替换旧结构。
          this._save();
        } else {
          this._data = mayBeOldDataStructure;
        }
      } catch (e) {
        this._data = {};
      }
    }
  }
  _checkStorageKey() {
    if (!this._storageKey) {
      throw new Error("must call setStorageKey('xxx') first");
    }
  }
  _getDataFromStorage() {
    this._checkStorageKey();
    return this._storage.getItem(this._storageKey) || {};
  }
  _save() {
    this._checkStorageKey();
    this._storage.setItem(this._storageKey, this._data);
  }
}
export default EventStorageManager;
