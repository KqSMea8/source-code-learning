/**
 * Created by lingxufeng@bytedance.com from PGC-FE on 2018/5/18.
 */
declare const console;

class Logger {
    isLog: boolean;

    constructor() {
        this.isLog = false;
    }

    init = (bool) => {
        this.isLog = bool;
    };
    info = (...args) => {
        if (this.isLog) {
            console.log("tea-miniProduct-sdk: ", ...args);
        }
    };
    error = (...args) => {
        if (this.isLog) {
            console.log(" ");
            console.error("tea-miniProduct-sdk: ", ...args);
            console.log(" ");
        }
    };
    warn = (...args) => {
        if (this.isLog) {
            console.warn("tea-miniProduct-sdk: ", ...args);
        }
    }
}

export default new Logger();
