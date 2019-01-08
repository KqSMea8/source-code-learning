// iPhone 6 (750x1334) 的分辨率为标准进行缩放。
DESIGN_WIDTH = 750;
DESIGN_HEIGHT = 1334;
var scale = BK.Director.screenPixelSize.width / DESIGN_WIDTH;
BK.Director.root.scale = {
  x: scale,
  y: scale
};

function toast(msg) {
  BK.UI.showToast({
    title: msg,
    duration: 1000
  });
}

var renderUI = function() {
  // Button
  var normal = 'GameRes://res/start_normal.png';
  var btn = new BK.Button(250, 100, normal, function() {
    BK.UI.showToast({
      title: 'toast',
      duration: 1500,
      complete: function() {
        BK.Script.log(0, 0, 'complete show');
      }
    });

    BK.Script.log(0, 0, 'button click!');
  });
  btn.position = { x: DESIGN_WIDTH / 2, y: DESIGN_HEIGHT / 2 };
  btn.anchor = { x: 0.5, y: 0.5 };
  btn.setPressTexturePath('GameRes://res/start_pressed.png');

  var superNode = new BK.Node();
  //其父节点都需要将canUserInteract置true
  superNode.canUserInteract = true;

  BK.Director.root.addChild(superNode);
  superNode.addChild(btn);
};

var request = function() {
  BK.Http.request({
    url: 'https://httpbin.org/anything?key=value',
    method: 'POST',
    headers: {
      Referer: 'https://hudong.qq.com',
      'User-Agent': 'brick-client',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ key: 'value' }),
    success: function(succObj) {
      console.log('statusCode', succObj.statusCode);
      console.log('headers', JSON.stringify(succObj.headers));
      var bodyStr = succObj.text();
      console.log('body', bodyStr);
    },
    fail: function(errObj) {
      console.log('error', errObj.msg);
    },
    complete: function() {
      console.log('complete');
    },
    uploadProgress: function(curr, total) {
      console.log('upload progress', curr / total);
    },
    downloadProgress: function(curr, total) {
      console.log('download progress', curr / total);
    }
  });
};
var storage = function() {
  BK.Device.keepScreenOn({ isKeepOn: true }); //开启常亮

  // BK.localStorage.clear();
  var name = BK.localStorage.getItem('name');
  BK.Console.log('name', name);
  BK.localStorage.setItem('name', 'cmgameuser');
  // BK.localStorage.removeItem('name');
};

/// --------

function loadTEA() {
  // toast(GameStatusInfo.openId);

  BK.Script.loadlib('GameRes://tea-sdk-qqgame.min.js');
  $$TEA.init(1338000);
  $$TEA.config({
    log: true,
    _staging_flag: 1, // 是否发送到测试库
    evtParams: {
      custom_platform: 'qqgame'
    },
    user_unique_id: GameStatusInfo.openId // open_id
  });
  $$TEA.send();
  $$TEA.event('event_after_send', {
    from: 'bb',
  });
  console.log($$TEA.getConfig());

  BK.Script.loadlib('GameRes://pagea.js');
}

loadTEA();
new BK.Game({
  onLoad: function() {
    BK.Console.log('load');

    // toast('load');

    BK.Director.ticker.setTimeout(function() {
      // toast(0, 0, 'Timeout call!2 curr = ' + BK.Time.timestamp);
    }, 3000);

    renderUI();
    // loadTEA();
    // request();
    // storage();
  }
});
