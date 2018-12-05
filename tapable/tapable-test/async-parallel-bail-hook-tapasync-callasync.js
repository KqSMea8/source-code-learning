const { AsyncParallelBailHook } = require( "../lib" );

// 如果某个cb在调用时传入了非undefined的值或error，会提早调用callAsync的回调，而不会等到后续的cb执行
let queue2 = new AsyncParallelBailHook( [ 'name' ] );
console.time( 'cost1' );
queue2.tapAsync( '1', function ( name, cb ) {
  setTimeout( () => {
    console.log( name, 1 );
    cb();
  }, 1000 );
} );
queue2.tapAsync( '2', function ( name, cb ) {
  setTimeout( () => {
    console.log( name, 2 );
    cb(undefined, 123);
  }, 2000 );
} );
queue2.tapAsync( '3', function ( name, cb ) {
  setTimeout( () => {
    console.log( name, 3 );
    cb();
  }, 3000 );
} );

queue2.callAsync( 'webpack', (err,result) => {
  // 此处的err,result是某个cb调用时传入的
  console.log( 'over','error: ',err,'result: ',result );
  console.timeEnd( 'cost1' );
} );

// 执行结果:
/*
webpack 1
webpack 2
webpack 3
*/

/**
 * function anonymous(name, _callback) {
  'use strict';
  var _context;
  var _x = this._x;
  var _results = new Array(3); // 每个tap的回调函数cb可能的调用参数
  // 检查_results结果集中是否存在不是undefined的
  var _checkDone = () => {
    for (var i = 0; i < _results.length; i++) {
      var item = _results[i];
      if (item === undefined) return false;
      if (item.result !== undefined) {
        _callback(null, item.result);
        return true;
      }
      if (item.error) {
        _callback(item.error);
        return true;
      }
    }
    return false;
  };
  do {
    var _counter = 3;
    var _done = () => {
      _callback();
    };
    if (_counter <= 0) break;
    var _fn0 = _x[0];
    // 调用tapAsync的回调函数，(_err0, _result0) => xxx是传给cb的实参
    _fn0(name, (_err0, _result0) => {
      // 如果cb在执行时传入了err参数
      if (_err0) {
        if (_counter > 0) {
          if (0 < _results.length && ((_results.length = 1), (_results[0] = { error: _err0 }), _checkDone())) {
            _counter = 0;
          } else {
            if (--_counter === 0) _done();
          }
        }
      } else {
        // 如果未传入err参数
        if (_counter > 0) {
          if (0 < _results.length && (_result0 !== undefined && (_results.length = 1), (_results[0] = { result: _result0 }), _checkDone())) {
            _counter = 0;
          } else {
            if (--_counter === 0) _done();
          }
        }
      }
    });
    if (_counter <= 0) break;
    if (1 >= _results.length) {
      if (--_counter === 0) _done();
    } else {
      var _fn1 = _x[1];
      _fn1(name, (_err1, _result1) => {
        if (_err1) {
          if (_counter > 0) {
            if (1 < _results.length && ((_results.length = 2), (_results[1] = { error: _err1 }), _checkDone())) {
              _counter = 0;
            } else {
              if (--_counter === 0) _done();
            }
          }
        } else {
          if (_counter > 0) {
            if (1 < _results.length && (_result1 !== undefined && (_results.length = 2), (_results[1] = { result: _result1 }), _checkDone())) {
              _counter = 0;
            } else {
              if (--_counter === 0) _done();
            }
          }
        }
      });
    }
    if (_counter <= 0) break;
    if (2 >= _results.length) {
      if (--_counter === 0) _done();
    } else {
      var _fn2 = _x[2];
      _fn2(name, (_err2, _result2) => {
        if (_err2) {
          if (_counter > 0) {
            if (2 < _results.length && ((_results.length = 3), (_results[2] = { error: _err2 }), _checkDone())) {
              _counter = 0;
            } else {
              if (--_counter === 0) _done();
            }
          }
        } else {
          if (_counter > 0) {
            if (2 < _results.length && (_result2 !== undefined && (_results.length = 3), (_results[2] = { result: _result2 }), _checkDone())) {
              _counter = 0;
            } else {
              if (--_counter === 0) _done();
            }
          }
        }
      });
    }
  } while (false);
}
*/