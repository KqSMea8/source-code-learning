/**
 * Created by lingxufeng@bytedance.com from PGC-FE on 2018/5/18.
 */
const undef = undefined;

class Env {
  constructor() {
    // https://code.byted.org/data/idl/blob/master/mario/event.proto
    this.envInfo = {
      user: {
        user_unique_id: undef, // 用户的唯一身份标识,一般为"{user_type}_{user_id}"
        user_type: undef, // Odin ID,如果用作推荐则是必选
        user_id: undef, // Odin ID,如果用作推荐则是必选
        user_is_auth: undef, // 用户是否是授权用户
        user_is_login: undef, // 用户是否已登录
        device_id: undef, // 设备id
        web_id: undef,
        ip_addr_id: undef,
        ssid: undef,
      },
      header: {
        app_id: undef, // 2;
        app_name: undef, // 3;
        app_install_id: undef, // 4;
        app_package: undef, // 5;//app包名
        app_channel: undef, // 6;//app分发渠道
        app_version: undef, // 7;//app版本
        os_name: undef, // 8;//客户端系统
        os_version: undef, // 9;//客户端系统版本号
        device_model: undef, // 10;//设备型号
        ab_client: undef, // 11;//ab实验客户端标识
        ab_version: undef, // 12;//ab实验分组信息
        traffic_type: undef, // 13;//流量类型
        utm_source: undef, // 14;
        utm_medium: undef, // 15;
        utm_campaign: undef, // 16;
        client_ip: undef, // 17;
        device_brand: undef, // 18;
        os_api: undef, // 19;
        access: undef, // 20;//网络访问类型
        language: undef, // 21;
        region: undef, // 22;
        app_language: undef, // 23;
        app_region: undef, // 24;
        creative_id: undef, // 25;
        ad_id: undef, // 26;
        campaign_id: undef, // 27;
        log_type: undef, // 28;//事件类型
        rnd: undef, // 29;//随机数

        platform: undef, // 30 平台类型
        sdk_version: undef, // 31 sdk版本号
        province: undef, // 32 省
        city: undef, // 33 城市
        timezone: undef, // 34 时区
        tz_offset: undef, // 35 时区偏移
        tz_name: undef, // 36 时区名

        sim_region: undef, // 37; //sim卡地区
        carrier: undef, // 38; //运营商

        resolution: undef, // 39 分辨率 screen_width x screen_height
        browser: undef, // 50 浏览器名
        browser_version: undef, // 51 浏览器版本号
        referrer: undef, // 52 前向地址
        referrer_host: undef, // 53前向域名

        // optional int32 screen_height = 54; //屏幕高度
        // optional int32 screen_width = 55; //屏幕宽度
        // optional float tz = 56; //float时区

        headers: { // 1. 自定义header,单层json map,需要dump成字符串
          utm_term: undef,
          utm_content: undef,
          custom: {},
        },
      },
    };
  }

    set = (key, value) => {
      let localKey = key;
      let localValue = value;
      if (localValue === null) {
        return false;
      }
      let scope = '';
      if (localKey.indexOf('.') > -1) {
        const tmp = localKey.split('.');
        scope = tmp[0];
        localKey = tmp[1];
      }

      if (localKey === 'os_version') {
        localValue = `${localValue}`;
      }
      if (scope) {
        // 白名单：user、header、headers、custom
        if (scope === 'user' || scope === 'header') {
          this.envInfo[scope][localKey] = localValue;
        } else if (scope === 'headers') {
          this.envInfo.header.headers[localKey] = localValue;
        } else {
          this.envInfo.header.headers.custom[localKey] = localValue;
        }
      } else if (this.envInfo.user.hasOwnProperty(localKey)) {
        // 类型转化与赋值
        //  几乎都是 str，唯一一个 user_type 明确约定是 Number
        //  https://wiki.bytedance.net/pages/viewpage.action?pageId=80723591
        if (['user_type', 'device_id', 'ip_addr_id'].indexOf(localKey) > -1) {
          this.envInfo.user[localKey] = Number(localValue);
        } else if (['user_id', 'web_id', 'user_unique_id', 'ssid'].indexOf(localKey) > -1) {
          this.envInfo.user[localKey] = String(localValue);
        } else if (['user_is_auth', 'user_is_login'].indexOf(localKey) > -1) {
          this.envInfo.user[localKey] = Boolean(localValue);
        }
      } else if (this.envInfo.header.hasOwnProperty(localKey)) {
        this.envInfo.header[localKey] = localValue;
      } else if (this.envInfo.header.headers.hasOwnProperty(localKey)) {
        this.envInfo.header.headers[localKey] = localValue;
      } else {
        this.envInfo.header.headers.custom[localKey] = localValue;
      }
    };

    get = () => {
      const tmp = {
        user: {},
        header: {
          headers: {
            custom: {},
          },
        },
      };
      const envInfo = this.envInfo;
      // user copy
      const user = envInfo.user;
      const userKeys = Object.keys(user);
      for (const item of userKeys) {
        if (user[item] !== undef) {
          tmp.user[item] = user[item];
        }
      }

      // header copy;
      const header = envInfo.header;
      const headerKeys = Object.keys(header);
      for (const item of headerKeys) {
        if (header[item] !== undef && item !== 'headers') {
          tmp.header[item] = header[item];
        }
      }
      // headers copy
      const headers = envInfo.header.headers;
      const headersKeys = Object.keys(headers);
      for (const item of headersKeys) {
        if (item !== 'custom' && headers[item] !== undef) {
          tmp.header.headers[item] = headers[item];
        }
      }
      // custom copy!
      const custom = envInfo.header.headers.custom;
      const customKeys = Object.keys(custom);
      if (customKeys.length) {
        for (const item of customKeys) {
          tmp.header.headers.custom[item] = custom[item];
        }
      }
      const ret = {
        user: tmp.user,
        header: {
          ...tmp.header,
          headers: tmp.header.headers,
        },
      };
      return ret;
    };
}

export default Env;
