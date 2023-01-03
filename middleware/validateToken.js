const jwt = require('jsonwebtoken');
const express = require('express');
const cookieParser = require('cookie-parser');
const { Token } = require('../models');

const router = express.Router();
router.use(cookieParser());
function verifyJWT(token, secretKey) {
  try {
    jwt.verify(token, secretKey);
    return true;
  } catch {
    return false;
  }
}

module.exports = router.use(async (req, res, next) => {
  const { Authorization } = req.cookies;
  // console.log(Authorization);
  const [authType, authToken] = (Authorization || '').split(' ');

  if (verifyJWT(authToken, process.env.JWTSECRETKEY)) {
    // 엑세스 토큰 검증 성공시
    // const payload = decodeJWT(authToken, process.env.JWT);
    const payload = jwt.decode(authToken, process.env.JWTSECRETKEY).userId;
    const token = await Token.findOne({ where: { userId: payload } });

    if (!token) {
      // 리프레시 토큰이 없을시
      const refreshToken = jwt.sign({}, process.env.JWTSECRETKEY, {
        expiresIn: '7d',
      });
      Token.create({ userId: payload, token: refreshToken }); // 리프레시 토큰발급 후 Token 테이블에 삽입

      next();
    }
    // if (verifyJWT(authToken, process.env.JWTSECRETKEY)) {

    // }
  }

  // 리프레시 토큰이 있을시
  if (!verifyJWT(authToken, process.env.JWTSECRETKEY)) {
    // 엑세스 토큰 검증 실패시
    // const payload = decodeJWT(authToken, process.env.JWT);
    const payload = jwt.decode(authToken, process.env.JWTSECRETKEY).userId;
    const token = await Token.findOne({ where: { userId: payload } });

    if (verifyJWT(token.token, process.env.JWTSECRETKEY)) {
      // 리프레시 토큰이 검증 되었다면
      const newAccessToken = jwt.sign(
        { userId: payload },
        process.env.JWTSECRETKEY,
        { expiresIn: '10s' }
      ); // 새로운 액세스 토큰 생성
      res.cookie('Authorization', `Bearer ${newAccessToken}`, {
        overwrite: true,
      }); // 쿠키  에 삽입.
      // res.locals.user = `Bearer ${newAccessToken}`;
      // 응답을 보내지 않게되면 쿠키가 갱신이 되지 않는다.?
      // console.log(newAccessToken);
      req.cookies.Authorization = `Bearer ${newAccessToken}`;
      // console.log(req.headers.cookie);

      // rest.locals.user , req.cookies.Authorizaion 둘다 가능.
    }
  }
  next();
});
