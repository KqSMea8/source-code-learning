/**
 * SDK的log，上报一次即可，不关心成功率，失败也无所谓。也没有用户标识，借用error事件的用户标识。
 *
 * SDK的log上报，要想统一使用Collecor实例，需要几个前提。目的是减少不必要的逻辑运行，也避免对用户造成干扰。
 * 前提功能：
 * - disable_storeUserID
 * - disable_storeEvent
 * - disable_webid
 * - disable_ssid
 * - url_domain 要与业务方一致。
 */

import Collector from './Collector';

const sdkTracker = new Collector('byted-tea-sdk');

sdkTracker.init({
  app_id: 1338,
  channel: 'cn',
  log: true,
});

sdkTracker.config({
  disable_ssid: true,
  disable_webid: true,

});


const onLoad = ({
  app_id, app_name, sdk_version, user_unique_id,
}) => {
  sdkTracker.config({
    user_unique_id,
  });
  sdkTracker('onload', {
    app_id,
    app_name: app_name || '',
    sdk_version,
  });
};


const onError = (code, errorEventDataArr) => {
  try {
    errorEventDataArr.forEach((eventData) => {
      const userObj = eventData.user;
      const headerObj = eventData.header;
      const eventsArr = eventData.events;

      const commonErrorParams = {
        error_code: code,
        app_id: headerObj.app_id,
        app_name: headerObj.app_name || '',
        header: JSON.stringify(headerObj),
        user: JSON.stringify(userObj),
      };

      sdkTracker.config({
        user_unique_id: userObj.user_unique_id,
      });
      eventsArr.forEach((eventObj) => {
        sdkTracker('on_error', {
          ...commonErrorParams,
          error_event_name: eventObj.event,
          error_event_params: eventObj.params, // string
          error_event_local_time_ms: eventObj.local_time_ms,
        });
      });
    });
  } catch (e) {
    // console.error('postErrLog: ', e.message);
  }
};

export {
  onError,
  onLoad,
};
export default sdkTracker;