const { AsyncParallelHook } = require("tapable");

let queue3 = new AsyncParallelHook(["name"]);
console.time("cost3");
queue3.tapPromise("1", function(name, cb) {
	return new Promise(function(resolve, reject) {
		setTimeout(() => {
			console.log(name, 1);
			resolve();
		}, 1000);
	});
});

queue3.tapPromise("1", function(name, cb) {
	return new Promise(function(resolve, reject) {
		setTimeout(() => {
			console.log(name, 2);
			resolve();
		}, 2000);
	});
});

queue3.tapPromise("1", function(name, cb) {
	return new Promise(function(resolve, reject) {
		setTimeout(() => {
			console.log(name, 3);
			resolve();
		}, 3000);
	});
});

queue3.promise("webpack").then(
	() => {
		console.log("over");
		console.timeEnd("cost3");
	},
	() => {
		console.log("error");
		console.timeEnd("cost3");
	}
);

/**
 * "function anonymous(name) {
  "use strict";
  return new Promise( ( _resolve, _reject ) => {
    var _sync = true;
    var _context;
    var _x = this._x;
    do
    {
      var _counter = 3;
      var _done = () => {
        _resolve();
      };
      if ( _counter <= 0 ) break;
      var _fn0 = _x[ 0 ];
      var _hasResult0 = false;
      var _promise0 = _fn0( name );
      if ( !_promise0 || !_promise0.then )
        throw new Error( 'Tap function (tapPromise) did not return promise (returned ' + _promise0 + ')' );
      _promise0.then( _result0 => {
        _hasResult0 = true;
        if ( --_counter === 0 ) _done();
      }, _err0 => {
        if ( _hasResult0 ) throw _err0;
        if ( _counter > 0 )
        {
          if ( _sync )
            _resolve( Promise.resolve().then( () => { throw _err0; } ) );
          else
            _reject( _err0 );
          _counter = 0;
        }
      } );
      if ( _counter <= 0 ) break;
      var _fn1 = _x[ 1 ];
      var _hasResult1 = false;
      var _promise1 = _fn1( name );
      if ( !_promise1 || !_promise1.then )
        throw new Error( 'Tap function (tapPromise) did not return promise (returned ' + _promise1 + ')' );
      _promise1.then( _result1 => {
        _hasResult1 = true;
        if ( --_counter === 0 ) _done();
      }, _err1 => {
        if ( _hasResult1 ) throw _err1;
        if ( _counter > 0 )
        {
          if ( _sync )
            _resolve( Promise.resolve().then( () => { throw _err1; } ) );
          else
            _reject( _err1 );
          _counter = 0;
        }
      } );
      if ( _counter <= 0 ) break;
      var _fn2 = _x[ 2 ];
      var _hasResult2 = false;
      var _promise2 = _fn2( name );
      if ( !_promise2 || !_promise2.then )
        throw new Error( 'Tap function (tapPromise) did not return promise (returned ' + _promise2 + ')' );
      _promise2.then( _result2 => {
        _hasResult2 = true;
        if ( --_counter === 0 ) _done();
      }, _err2 => {
        if ( _hasResult2 ) throw _err2;
        if ( _counter > 0 )
        {
          if ( _sync )
            _resolve( Promise.resolve().then( () => { throw _err2; } ) );
          else
            _reject( _err2 );
          _counter = 0;
        }
      } );
    } while ( false );
    _sync = false;
  } );

} "
 *
*/

/*
webpack 1
webpack 2
webpack 3
over
cost3: 3007.925ms
*/
