import adapter from './adapter'
const prefix = 'tea-sdk:';
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
            adapter.console.info(prefix, ...args);
        }
    };
    error = (...args) => {
        if (this.isLog) {
            adapter.console.error(prefix, ...args);
        }
    };
    warn = (...args) => {
        if (this.isLog) {
            adapter.console.warn(prefix, ...args);
        }
    }
}

export default new Logger();
