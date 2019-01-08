class MemoryCache {
  constructor() {
    this.cache = {};
  }

  setItem = (cacheKey, data) => {
    this.cache[cacheKey] = data;
  };

  getItem = cacheKey => this.cache[cacheKey];

  removeItem = (cacheKey) => {
    this.cache[cacheKey] = undefined;
  };

  clear = () => { this.cache = {}; };
}

export default new MemoryCache();
export {
  MemoryCache,
};
