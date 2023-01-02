const jwt = require('jsonwebtoken');

function createJWT(payload, secretKey, expiresTime) {
  return jwt.sign({ userId: payload }, secretKey, { expiresIn: expiresTime });
}

function verifyJWT(token, secretKey) {
  // console.log(token, secretKey);
  try {
    jwt.verify(token.split(' ')[1], secretKey);
    return true;
  } catch {
    return false;
  }
}

function decodeJWT(token, secretKey) {
  try {
    const payload = jwt.decode(token.split(' ')[1], secretKey);
    return payload.userId;
  } catch (e) {
    return false;
  }
}

module.exports = { createJWT, verifyJWT, decodeJWT };
