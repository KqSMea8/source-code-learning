const { AsyncParallelBailHook } = require( "../lib" );

let queue3 = new AsyncParallelBailHook( [ 'name' ] );
console.time( 'cost3' );
// 如果某个tapPromsie的回调Promise resolve或reject的参数不为空，
// 会直接导致Hook.promise得到resolve或reject，而不会等后面的tapPromise回调得到resolve或reject
queue3.tapPromise( '1', function ( name ) {
  return new Promise( function ( resolve, reject ) {
    setTimeout( () => {
      console.log( name, 1 );
      resolve( '123' );// resolve或reject的参数非undefined时，会直接resolve或reject最后的queue3.promise
    }, 1000 );
  } );
} );

queue3.tapPromise( '2', function ( name ) {
  return new Promise( function ( resolve, reject ) {
    setTimeout( () => {
      console.log( name, 2 );
      reject( 'wrong' );
    }, 2000 );
  } );
} );

queue3.tapPromise( '3', function ( name ) {
  return new Promise( function ( resolve, reject ) {
    setTimeout( () => {
      console.log( name, 3 );
      resolve();
    }, 3000 );
  } );
} );

queue3.promise( 'webpack' )
// 此处的result和err都是某个tapPromise回调resolve或reject的参数
  .then( (result) => {
    console.log( 'over', 'result: ',result );
    console.timeEnd( 'cost3' );
  }, (err) => {
    console.log( 'error: ',err );
    console.timeEnd( 'cost3' );
  } );

// 执行结果:
/*
webpack 1
webpack 2
error
cost3: 2009.970ms
webpack 3
*/
