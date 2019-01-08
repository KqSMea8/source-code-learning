/**
 * qq轻游戏（厘米游戏）版本
 */
import Channel from './channel';
import env from './env';
import logger from './logger';

class QQGameTEA {
  channel: any;
  reportUrl: string;
  callbackSend: boolean;

  constructor() {
    this.callbackSend = false;
    this.channel = new Channel();
    this.reportUrl = 'https://mcs.snssdk.com';
    env.callback = () => {
      if (this.callbackSend) {
        this.send();
      }
    };
  }

  // 暴露 tea 的 config 信息给业务方
  getConfig = () => {
    return env.get();
  };
  /**
   * @param app_id
   * appId 步骤强行提前，因为设计到user_unique_id 的优先级问题
   */
  init = app_id => {
    if (typeof app_id !== 'number') {
      throw new Error('app_id must be a number');
    }
    env.set('app_id', app_id);
  };
  config = (conf: any) => {
    // config 时停止上报，config 结束之后主动调用 send 才会开启上报;
    this.channel.setReady(false);
    if (typeof conf !== 'object') {
      throw new Error('config param must be {}');
    }
    // 提前写
    if (conf.log) {
      logger.init(Boolean(conf.log));
      logger.info('logger 功能开启');
    }
    logger.info('当前配置项：', JSON.stringify(conf, null, 2));
    const keys = Object.keys(conf);
    if (!keys.length) {
      return false;
    }
    for (let key of keys) {
      const val = conf[key];
      // 通用 eventParams
      if (key === 'evtParams') {
        this.channel.setEvtParams(val);
      }
      // 是否到 starg 标识
      else if (key === '_staging_flag') {
        if (val + '' === '1') {
          logger.warn('根据_staging_flag设置，数据将会上报到stag 表。');
        }
        this.channel.setEvtParams({
          _staging_flag: val
        });
      } else {
        // 去掉log
        if (key !== 'log') {
          env.set(key, val);
        }
      }
    }
  };
  send = () => {
    if (env.isUserTokensReady) {
      logger.warn('看到本提示，意味着用户信息已完全就绪，上报通道打开');
      logger.info('用户信息', JSON.stringify(env.get().user, null, 2));
      this.channel.setReady(true);
    } else {
      this.callbackSend = true;
    }
  };
  event = (event: string, params: object) => {
    if (!params) {
      params = {};
    }
    if (typeof params !== 'object') {
      logger.error(
        '事件params 必须是{}:',
        'event(event: string, params: object)'
      );
    }
    const evtData = {
      event,
      params,
      local_time_ms: +new Date()
    };
    this.channel.event(evtData);
  };
}

// 导出依然是单例，跟 main sdk 保持一致
const TEA = new QQGameTEA();
export default TEA;
