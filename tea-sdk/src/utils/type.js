class Type {
  isString(o) {
    return Object.prototype.toString.call(o).slice(8, -1) === 'String';
  }

  isNumber(o) {
    return Object.prototype.toString.call(o).slice(8, -1) === 'Number';
  }

  isBoolean(o) {
    return Object.prototype.toString.call(o).slice(8, -1) === 'Boolean';
  }

  isFunction(o) {
    return Object.prototype.toString.call(o).slice(8, -1) === 'Function';
  }

  isNull(o) {
    return Object.prototype.toString.call(o).slice(8, -1) === 'Null';
  }

  isUndefined(o) {
    return Object.prototype.toString.call(o).slice(8, -1) === 'Undefined';
  }

  isObj(o) {
    return Object.prototype.toString.call(o).slice(8, -1) === 'Object';
  }

  isArray(o) {
    return Object.prototype.toString.call(o).slice(8, -1) === 'Array';
  }

  isFalse(o) {
    if (o === '' || o === undefined || o === null || o === 'null' || o
            === 'undefined' || o === 0 || o === false || o === NaN) return true;
    return false;
  }

  isTrue(o) {
    return !this.isFalse(o);
  }

  isLowIE() {
    return window.XDomainRequest;
  }
}

export default new Type();
