import adapter from './adapter'
import logger from './logger';

const postData = (payload, success, fail) => {
    const sendRandom = +new Date() + Math.floor(Math.random() * 100000);

    adapter.request({
        url: `https://mcs.snssdk.com/v1/list?tea_sdk_random=${sendRandom}`,
        method: "POST",
        headers: {
          "Content-Type": "text/plain; charset=utf-8"
        },
        data: payload,
        success: (dataObj) => {
            if (typeof dataObj === "string") {
                logger.error("数据上报失败");
                fail();
            }
            else {
                if (dataObj.e === 0) {
                    logger.warn('数据上报成功: ', payload);
                }
                else {
                    logger.error('数据上报失败！', `错误码：${dataObj.e}`);
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
