import defaultCollectorClient, { Collector } from '/es/index.min.js';
window.collectEvent = defaultCollectorClient;

// 默认方式
defaultCollectorClient.predefinePageView();
defaultCollectorClient('fake_pv', {
  instance: 'tracker',
});

// 示例2
const tracker = new Collector('tracker');
tracker('fake_pv1', {
  instance: 'tracker',
});
tracker.init({
  app_id: 13801111,
  channel: 'cn',
  log: true,
});
tracker.start();
tracker('fake_pv', {
  instance: 'tracker',
});
