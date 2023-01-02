const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const { User } = require('../models');
const { createJWT } = require('../modules/jwt');

/**
 *
 * @param {*} password 비밀번호 평문
 * @param {*} encryptedPassword 암호화된 비밀번호
 * @returns 비밀번호가 맞는지 검증후 Boolean으로 반환
 */
function passwordVerification(password, encryptedPassword) {
  return bcrypt.compareSync(password, encryptedPassword);
}

const router = express.Router();
require('dotenv').config();

router.use(cookieParser());

router.post('/', async (req, res) => {
  try {
    const { nickname, password } = req.body;
    const user = await User.findOne({ where: { nickname } }) ?? false; // 존재하지 않는 닉네임 일경우 false를 반환

    if (!user) {
      return res.status(412).json({ errorMessage: '닉네임 또는 패스워드를 확인해주세요.' });
    }

    if (!passwordVerification(password, user.password)) {
      return res.status(412).json({ errorMessage: '닉네임 또는 패스워드를 확인해주세요.' });
    }

    const token = createJWT(user.userId, process.env.JWTSECRETKEY, '10s');
    // res.setHeader('Authorization', `Bearer ${token}`);
    res.cookie('Authorization', `Bearer ${token}`);
    // res.writeHead('Authorization', `Bearer ${token}`);
    return res.status(201).header('Authorization', token).json({ token });
  } catch (e) {
    return res.status(400).json({ errorMessage: '로그인에 실패하였습니다.' });
  }
});

module.exports = router;

// try {
//   const { nickname, password } = req.body;

//   const user = await User.findOne({ where: { nickname, password } });

//   if (!user) {
//     return res.status(412).json({ errorMessage: '닉네임 또는 패스워드를 확인해주세요.' });
//   }

//   // 로그인 성공시 코드
//   // JWT 발급
//   const token = jwt.sign({ userId: user.userId }, process.env.JWTSECRETKEY);
//   res.cookie('Authorization', `Bearer ${token}`);
//   return res.status(201).json({ token });
// } catch {
//   return res.status(400).json({ errorMessage: '로그인에 실패하였습니다.' });
// }
