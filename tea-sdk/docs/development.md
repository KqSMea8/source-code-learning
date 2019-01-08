# 开发 web版SDK

### 开发与异步引入测试

`npm start` 启动 dev-server。

访问`http://127.0.0.1:8899/`，其实打开的是`demo/index.html`页面。

### 同步引入测试

`npm start` 启动 dev-server。

`npm run dev` 启动rollup的编译。

访问`http://127.0.0.1:8899/demo/sync-index.html`。


# 发版

- `npm run release` 升级版本
- `git tag 3x.3x.18x -m xxxx` 打标签，tagName为版本，并写明该版本的改动内容。
- `git push origin xxx` xxx为tagName。提交tag到远端。

### 发npm

- `npm publish`

### 发cdn

> scm地址：http://cloud.bytedance.net/scm/detail/4935/versions

- 发布scm，更新cdn版本。注意勾选 aws 和 阿里云

cdn地址：
- 国内 https://s3.pstatp.com/pgc/tech/collect/collect-v.3.1.7.js
- 国际化 https://s0.ipstatp.com/static_magic/pgc/tech/collect/collect-v.3.1.7.js


# 开发小程序系列版本 SDK

package.json 里 versions 字段下手动修改对应的版本。

npm run build 时，构建打包对应文件到 /plugins 下。
