// npm install byted-tea-sdk --save
import Tea, { Collector } from 'byted-tea-sdk';

// 1. 初始化SDK，必须。
Tea.init({
  app_id: xxxx, //  number类型的appId。
  channel: 'cn',
});

// 2. 按需配置
Tea.config({
  log: true,
});

// 3. 配置完毕
// 场景：用户的 config 依赖一个异步返回值，比如服务端异步下发的 user_unique_id
// 以上场景，在异步返回之前，事件数据都必须被 hold 住，直到异步事件返回
// sdk 本身无法监控这种异步值（没有固定的 key，有可能有多个）
// 所以 sdk 定义了一个 send 方法：只要该方法被调用，才说明用户已自主处理好了 config 相关事宜
// send()之后，sdk 才会装配、发送数据
Tea.send();

// 4. 发送事件。事件会等到Tea.send()调用后，才真正发出。
Tea('enter_page', {
  from: 'index',
});

const FeedbackCollector = new Collector();
FeedbackCollector.init({});
FeedbackCollector.config({});
FeedbackCollector.send();
FeedbackCollector('click_send', {});