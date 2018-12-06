const { SyncHook } = require("tapable");
let queue = new SyncHook(["name"]); //所有的构造函数都接收一个可选的参数，这个参数是一个字符串的数组。

// 订阅
queue.tap("1", function(name) {
	// tap 的第一个参数是用来标识订阅的函数的
	console.log(name, 1);
	return "1";
});
queue.tap("2", function(name) {
	console.log(name, 2);
});

// 发布
queue.call("webpack");
