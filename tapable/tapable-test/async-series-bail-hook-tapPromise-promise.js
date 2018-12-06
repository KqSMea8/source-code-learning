const { AsyncSeriesBailHook } = require( "../lib" );
let queue3 = new AsyncSeriesBailHook( [ 'name' ] );
console.time( 'cost3' );
queue3.tapPromise( '1', function ( name ) {
  return new Promise( function ( resolve, reject ) {
    setTimeout( function () {
      console.log( name, 1 );
      resolve();
    }, 1000 )
  } );
} );
queue3.tapPromise( '2', function ( name, callback ) {
  return new Promise( function ( resolve, reject ) {
    setTimeout( function () {
      console.log( name, 2 );
      reject();
    }, 2000 )
  } );
} );
queue3.tapPromise( '3', function ( name, callback ) {
  return new Promise( function ( resolve ) {
    setTimeout( function () {
      console.log( name, 3 );
      resolve();
    }, 3000 )
  } );
} );
queue3.promise( 'webpack' ).then( err => {
  console.log( err );
  console.log( 'over' );
  console.timeEnd( 'cost3' );
}, err => {
  console.log( err );
  console.log( 'error' );
  console.timeEnd( 'cost3' );
} );
// 执行结果：
/*
webpack 1
webpack 2
undefined
error
cost3: 3017.608ms
*/
