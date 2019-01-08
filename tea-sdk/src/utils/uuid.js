/* eslint-disable */
// https://gist.github.com/jed/982883
// 因为web_id只能由数字组成,且只能是19位。所以略作修改。

function b(
  a                  // placeholder
){
  return a           // if the placeholder was passed, return
    ? (              // a random number from 0 to 15
      a ^            // unless b is 8,
      Math.random()  // in which case
      * 16           // a random number from
      >> a/4         // 8 to 11
    ).toString(10) // in hexadecimal // 改动为10
    : (              // or otherwise a concatenated string:
      [1e7] +        // 10000000 +
      -1e3 +         // -1000 +
      -4e3 +         // -4000 +
      -8e3 +         // -80000000 +
      -1e11          // -100000000000,
    ).replace(     // replacing
      /[018]/g,    // zeroes, ones, and eights with
      b            // random hex digits
    )
}




//
const webid=()=>{
  return b().replace(/-/g,'').slice(0,19);
}
export default webid;