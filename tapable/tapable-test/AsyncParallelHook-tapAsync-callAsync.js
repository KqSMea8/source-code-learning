const { AsyncParallelHook } = require("tapable");

let queue2 = new AsyncParallelHook(["name"]);
console.time("cost1");
queue2.tapAsync("1", function(name, cb) {
	setTimeout(() => {
		console.log(name, 1);
		// cb("error1");
	}, 1000);
});
queue2.tapAsync("2", function(name, cb) {
	setTimeout(() => {
		console.log(name, 2);
		// cb("error2");
	}, 2000);
});
queue2.tapAsync("3", function(name, cb) {
	setTimeout(() => {
		console.log(name, 3);
		// cb("error3");
	}, 3000);
});

queue2.callAsync("webpack", err => {
	console.log("over");
	console.log("err", err);
	console.timeEnd("cost1");
});

/**
 * function anonymous(
  name,
  _callback,
) {
  'use strict';
  var _context;
  var _x = this._x;
  do
  {
    var _counter = 3;
    var _done = () => {
      _callback();
    };
    if ( _counter <= 0 ) break;
    var _fn0 = _x[ 0 ];
    // _err0: tapAsync回调触发时传入的参数， 回调触发后才会修改counter
    _fn0( name, _err0 => {
      if ( _err0 )
      {
        if ( _counter > 0 )
        {
          _callback( _err0 );
          _counter = 0;
        }
      } else
      {
        if ( --_counter === 0 ) _done();
      }
    } );
    if ( _counter <= 0 ) break;
    var _fn1 = _x[ 1 ];
    _fn1( name, _err1 => {
      if ( _err1 )
      {
        if ( _counter > 0 )
        {
          _callback( _err1 );
          _counter = 0;
        }
      } else
      {
        if ( --_counter === 0 ) _done();
      }
    } );
    if ( _counter <= 0 ) break;
    var _fn2 = _x[ 2 ];
    _fn2( name, _err2 => {
      if ( _err2 )
      {
        if ( _counter > 0 )
        {
          _callback( _err2 );
          _counter = 0;
        }
      } else
      {
        if ( --_counter === 0 ) _done();
      }
    } );
  } while ( false );
}
*/

// 执行结果
/*
webpack 1
webpack 2
webpack 3
over
time: 3004.411ms
*/
