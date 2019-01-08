/**
 * 实例 feedback
 */
window.collectEvent('feedback.init', {
  app_id: 133800000, // sdk's own appid
  channel: 'internal',
  // channel_domain:'https://mcs.byted.org/log/', // 与channel同时存在时，此值优先级更高
  log: true,
  disable_sdk_monitor: true,
  disable_webid: true,
  disable_storage: true,
});
window.collectEvent('feedback.config', {
  // user_id: 'sfdfjoisjo', // 测试“错误的事件格式”
  // user_unique_id: 'xxx',
  // web_id: '0',
  _staging_flag: 1,
  disable_ssid: true,
  // disable_auto_pv: true,
});
window.collectEvent('feedback.event.config', {
  feedback: 1,
});
window.collectEvent('feedback.start');
window.collectEvent('feedback.feedback_page_view', {
  feedback: 1,
});

/**
 * 实例 default
 */

window.collectEvent('beforeInit', {
  a: 1,
  __disable_storage__: 1,
});

// 测试在SDK加载完后，才调用init设置app_id的场景。
setTimeout(function() {
  // 初始化业务配置
  window.collectEvent('init', {
    app_id: 1338, // sdk's own appid
    // app_id: 1296, // faceu . ssid disabled.
    channel: 'internal',
    // channel_domain:'https://mcs.byted.org/log/', // 与channel同时存在时，此值优先级更高
    log: true,
    disable_sdk_monitor: true,
    // disable_storage: true,
    // disable_webid: true,
    // disable_ssid: true,
    batch_time: 30,
    max_batch_num: 5,
  });
  window.collectEvent('beforeConfig', { a: 1 });
  window.collectEvent('config', {
    // user_id: 'sfdfjoisjo',// 测试“错误的事件格式”
    // web_id: '', // 设置web_id后，并不会修改存储的web_id。但发送的事件以此为准。异步获取web_id有顺序覆盖的问题。
    // user_id: 1323123,
    user_unique_id: 'xxx',
    // user_unique_id: '0',
    // device_id: 2222323123,
    app_name: '哈哈哈哈哈',
    // app_version: '1.2.3',

    // 指定scope，
    'headers.scope_headers': 111,
    'user.scope_user': 111,
    'header.scope_header': 111,
    'custom.scope_custom': 111,
    // referrer:'',

    custom_key: 222,
    // log: true,
    _staging_flag: 1,
    // disable_ssid: true, // deprecated
    disable_auto_pv: true,
    reportErrorCallback(eventData, errorCode) {
      console.error('[sdk error] %o : %s', eventData, errorCode);
    },
  });
  // 等待ssid 请求完成。
  setTimeout(function() {
    window.collectEvent('eventBeforeSend', { aaa: 1 });
  }, 2000);

  setTimeout(function() {
    window.collectEvent('config', {
      evtParams: {
        username: 'zhangsan',
        commonParams: 'daily',
        e: 'f',
      },
    });

    window.collectEvent('config', {
      evtParams: {
        username: 'lisi',
      },
    });
    window.collectEvent('start');
    window.collectEvent('eventAfterSend', { bbb: 1, __disable_storage__: 1 });
  }, 1000);
}, 1000);

for (let i = 0; i < 1; i++) {
  window.collectEvent(`event.config`, { rdm: i });
}

// 测试批量发事件。
window.collectEvent(
  ['batchEvent1', { batchType: 1, __disable_storage__: 1 }],
  ['batchEvent2'],
  ['batchEvent3', { batchType: 3 }],
  ['batchEvent4', { batchType: 4 }],
);
// 测试collect方法，暂时不暴露。
// window.collectEvent('collect', 'eventMethod', { param: 22 })

// 测试业务方在onbeforeunload发送事件
const startTime = new Date().getTime();
window.onbeforeunload = function() {
  const finishTime = new Date().getTime();
  console.log('**', finishTime - startTime);
  window.collectEvent('reflow_video_stay', {
    staying_time: finishTime - startTime,
  });
};

// 测试业务方在visibilitychange,hidden发送事件
document.addEventListener(
  'visibilitychange',
  () => {
    // console.log('visibilitychange: ', document.visibilityState);
    if (document.visibilityState === 'hidden') {
      // console.log('visibilitychange:hidden event');
      window.collectEvent('visibilitychange:hidden');
    }
  },
  false,
);

window.refresh = function() {
  window.collectEvent('refresh');
  window.location.reload();
};
window.sendAEvent = function() {
  window.collectEvent('click event', {
    randNum: Math.random(),
    __disable_storage__: 1,
  });
};
window.sendPVEvent = function() {
  window.collectEvent('predefinePageView');
};
