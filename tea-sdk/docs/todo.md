- 输入自动校验和容错原则不统一或一致。没有统一入口。
- 

## refactor 

2018-9-16
- 整理SDK接管异步的逻辑。
- 不同api调用方式，统一入口(this._collet)。
- 没有初始化app_id前的指令，都放到异步的队列中。


2018-11-5
- 新增 EventStorageManager。优化事件发送队列；减少localstorage读取次数（写入次数不变）
- 重构发送事件的逻辑。事件批次的发送顺序，由串行发送改为并行发送。事件发送开始时间提前，提升上报率。
- 新增 disable_cache 接口。允许部分事件不会本地存储。