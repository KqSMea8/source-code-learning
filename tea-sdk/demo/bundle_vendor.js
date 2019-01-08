import { Collector } from '../lib/index.min.js';

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
