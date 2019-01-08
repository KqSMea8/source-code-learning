
const perf = (func, loopTimes = 5000000) => {
    const start = new Date();
    for (let i = 0; i < loopTimes; i++) {
        func();
    }
    const end = new Date();
    console.log(end - start);
};


let event = 'event.config';
let reg = /^event\./;

perf(() => {
    if (reg.test(event)) {
        const b = event.slice(6);
    }
});

perf(() => {
    const b = event.replace(reg, '');
});