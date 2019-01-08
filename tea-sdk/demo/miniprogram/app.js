// app.js

const tea = require('./utils/tea-sdk-miniProduct.min.js');

tea.init(1338000);
tea.config({
  log: true,
  evtParams: {
    wori: 'haha',
  },
});

App({
  onLaunch() {

    this.$$TEA = tea;

    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || [];
    logs.unshift(Date.now());
    wx.setStorageSync('logs', logs);

    // 登录
    wx.login({
      success: (res) => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        tea.config({
          user_unique_id: 1231,
        });
        tea.send();
        console.log(tea.getConfig());
      },
    });
    // 获取用户信息
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: (res) => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo;
              console.log(res);

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res);
              }
            },
          });
        }
      },
    });

    this.$$TEA.event('eventaa');
  },
  onShow(res) {
    this.$$TEA.mpEnter({
      launch_from: `${res.scene}`,
    });
  },
  onHide() {
    this.$$TEA.mpExit();
  },
  globalData: {
    userInfo: null,
  },
});