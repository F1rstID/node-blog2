// 파라메터 검증
function parameterVerification(param) {
  const paramRegExp = /^[0-9]*$/;
  return paramRegExp.test(param);
}

module.exports = parameterVerification;
