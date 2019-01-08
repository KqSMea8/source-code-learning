declare const require;
const fetch = require('@system.fetch')
import logger from './logger';

const postData = (payload, success, fail) => {
    const sendRandom = +new Date() + Math.floor(Math.random() * 100000);
    fetch.fetch({
        url: `https://mcs.snssdk.com/v1/list?tea_sdk_random=${sendRandom}`,
        data: payload,
        method: "POST",
        header: {
            "Content-Type": "text/plain"
        },
        success: (res) => {
            let data = res.data
            try {
                data = JSON.parse(data)
            } catch (e) {
                logger.error("response反序列化错误");
                fail()
                return
            }
            if (typeof data === "string") {
                logger.error("数据上报失败");
                fail();
            }
            else {
                if (data.e === 0) {
                    logger.warn('数据上报成功: ', payload);
                }
                else {
                    logger.error('数据上报失败！', `错误码：${data.e}`);
                    logger.error('为了避免后续上报数据被阻塞，sdk 将不再重试上报本数据，数据实体将会从 localstorage 清除');
                }
                success();
            }
        },
        fail: () => {
            logger.error("数据上报失败");
            fail();
        }
    })
};

export default postData
