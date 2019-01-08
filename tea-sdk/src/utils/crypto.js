/* eslint-disable no-param-reassign */
function decrypto(str, xor, hex) {
  if (typeof str !== 'string' || typeof xor !== 'number' || typeof hex !== 'number') {
    return;
  }
  let strCharList = [];
  const resultList = [];
  hex = hex <= 25 ? hex : hex % 25;
  // 解析出分割字符
  const splitStr = String.fromCharCode(hex + 97);
  // 分割出加密字符串的加密后的每个字符
  strCharList = str.split(splitStr);

  for (let i = 0; i < strCharList.length; i++) {
    // 将加密后的每个字符转成加密后的ascll码
    let charCode = parseInt(strCharList[i], hex);
    // 异或解密出原字符的ascll码
    charCode = (charCode * 1) ^ xor;
    const strChar = String.fromCharCode(charCode);
    resultList.push(strChar);
  }
  const resultStr = resultList.join('');
  return resultStr;
}

const decodeXXX = string => decrypto(string, 64, 25);
export default decodeXXX;