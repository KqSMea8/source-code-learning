const { AsyncSeriesHook } = require( "../lib" );

let queue3 = new AsyncSeriesHook( [ 'name' ] );
console.time( 'cost3' );
/**
 * 只有执行了前一个tapPromise回调里的Promise完成后，才会执行后一个tapPromise的回调Promise。
 * 如果Promsie reject了，此时会跳过后续的tapPromise回调，直接执行hook.promise的then回调，参数就是error对象
*/
queue3.tapPromise( '1', function ( name ) {
  return new Promise( function ( resolve ) {
    setTimeout( function () {
      console.log( name, 1 );
      resolve(123);
    }, 1000 )
  } );
} );
queue3.tapPromise( '2', function ( name ) {
  return new Promise( function ( resolve,reject ) {
    setTimeout( function () {
      console.log( name, 2 );
      // reject('tapPromise2 reject');
      throw 'tapPromise2 reject'
    }, 2000 )
  } );
} );
queue3.tapPromise( '3', function ( name ) {
  return new Promise( function ( resolve ) {
    setTimeout( function () {
      console.log( name, 3 );
      resolve();
    }, 3000 )
  } );
} );
queue3.promise( 'webapck' ).then( err => {
  console.log( 'err: ', err );
  console.timeEnd( 'cost3' );
} )

// 执行结果
/*
webapck 1
webapck 2
webapck 3
undefined
cost3: 6021.817ms
*/
