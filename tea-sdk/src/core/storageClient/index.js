/**
 * 可配置选择使用 localstorage 或 memory。
 * 若 localstorage 不支持，则默认回退到 memory。
 */
import { MemoryCache } from './memoryCache';
import persistentStorage from './storageCache';

export default class StorageClient {
  constructor(isMemory = false) {
    const isUsePersisten = !isMemory && persistentStorage.isSupportLS;
    this._storage = isUsePersisten ? persistentStorage : new MemoryCache();
  }
  // 取不到默认返回 undefined
  getItem(key) {
    return this._storage.getItem(key);
  }
  setItem(key, value) {
    this._storage.setItem(key, value);
  }
  removeItem(key) {
    this._storage.removeItem(key);
  }
  clear() {
    this._storage.clear();
  }
}