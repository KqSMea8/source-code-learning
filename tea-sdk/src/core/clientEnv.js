/* global SDK_VERSION */
import Env from './env';
import browser from '../helper/clientDetect';

const date = new Date();
const timeZoneMin = date.getTimezoneOffset();

// 服务端约定为int类型。但获取到的值可能是非整时区。 比如offset可能为 30600 / 60 = 8.5
// 没有找到为什么
const timezone = parseInt(-timeZoneMin / 60, 10); // hour

const tz_offset = timeZoneMin * 60; // second

let sdk_version;
try {
  sdk_version = SDK_VERSION;
} catch (e) {
  sdk_version = '2.x';
}

class ClientEnv extends Env {
  constructor() {
    super();
    this.initClientEnv();
  }

  initClientEnv = () => {
    this.set('os_name', browser.os_name);
    this.set('os_version', browser.os_version);
    this.set('device_model', browser.device_model);
    this.set('platform', browser.platform);
    this.set('sdk_version', sdk_version);
    this.set('browser', browser.browser);
    this.set('browser_version', browser.browser_version);
    this.set('language', browser.language);
    this.set('timezone', timezone);
    this.set('tz_offset', tz_offset);
    this.set('resolution', `${browser.screen_width}x${browser.screen_height}`);
    this.set('screen_width', browser.screen_width);
    this.set('screen_height', browser.screen_height);
    this.set('referrer', browser.referrer);
    this.set('referrer_host', browser.referrer_host);
    this.set('utm_source', browser.utm_source);
    this.set('utm_medium', browser.utm_medium);
    this.set('utm_campaign', browser.utm_campaign);
    this.set('utm_term', browser.utm_term);
    this.set('utm_content', browser.utm_content);
  };
}

// 所有应用公用，一份就够了
export default new ClientEnv();

