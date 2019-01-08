declare const wx;
declare const console;


class StorageCache {
    get = (key) => {
        let ret: any = '';
        try {
            let value = wx.getStorageSync(key);
            if (value) {
                value = JSON.parse(value);
                ret = value;
            }
        } catch (e) {
            console.error(e.message);
        }
        return ret;
    };
    set = (key, value) => {
        try {
            wx.setStorageSync(key, value)
        }
        catch (e) {
            console.error(e)
        }
    }
}


export default new StorageCache();
