// const { Op } = require('sequelize');
const express = require('express');
const bcrypt = require('bcrypt');
const { User } = require('../models');
require('dotenv').config();
/**
 *
 * @param {*} nickname 닉네임
 * @returns 닉네임이 최소 3글자 이상이고, 영문 대소문자와 숫자로만 이루어져 있는지 검증후 Boolean으로 반환
 */
function isNickname(nickname) {
  if (nickname.length < 2) {
    return false;
  }

  const nicknameRegExp = /^[a-zA-Z0-9]*$/;

  if (!nicknameRegExp.test(nickname)) {
    return false;
  }

  return true;
}
/**
 *
 * @param {*} password 비밀번호
 * @returns 비밀번호가 최소 4글자 이상인지 검증한 결과를 Boolean으로 반환
 */
function isPassword(password) {
  if (password.length < 3) {
    return false;
  }

  return true;
}
/**
 *
 * @param {*} password 비밀번호
 * @param {*} nickname 닉네임
 * @returns 비밀번호에 닉네임이 포함되는지 여부를 Boolean으로 반환
 */
function isIncludePasswordNickname(password, nickname) {
  const passwordInNicknameRegExp = new RegExp(`${nickname}`, 'g');

  if (passwordInNicknameRegExp.test(password)) {
    return false;
  }
  return true;
}
/**
 *
 * @param {*} password 암호화할 비밀번호
 * @returns 암호화된 비밀번호
 */
function passwordEncryption(password) {
  return bcrypt.hashSync(password, Number(process.env.SALT));
}

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { nickname, password, confirm } = req.body;
    const existsUsers = await User.findAll({
      where: { nickname },
    });

    if (existsUsers.length) {
      return res.status(412).json({ errorMessage: '중복된 닉네임입니다.' });
    }

    if (password !== confirm) {
      return res.status(412).json({ errorMessage: '패스워드가 일치하지 않습니다.' });
    }

    if (!isNickname(nickname)) {
      return res.status(412).json({ errorMessage: '닉네임의 형식이 일치하지 않습니다.' });
    }

    if (!isPassword) {
      return res.status(412).json({ errorMessage: '패스워드 형식이 일치하지 않습니다.' });
    }

    if (!isIncludePasswordNickname(password, nickname)) {
      return res.status(412).json({ errorMessage: '패스워드에 닉네임이 포함되어 있습니다.' });
    }
    const encryptedPassword = passwordEncryption(password);
    await User.create({
      nickname,
      password: encryptedPassword,
    });
    return res.status(201).send({});
  } catch (e) {
    console.log(e);
    return res.status(412).json({ errorMessage: '요청한 데이터 형식이 올바르지 않습니다.' });
  }
});

module.exports = router;
