const cookieParser = require('cookie-parser');
const express = require('express');
const jwt = require('jsonwebtoken');
const { User, Post } = require('../models');

const router = express.Router();

router.use(cookieParser());

// 토큰 검증
function validateToken(token) {
  try {
    jwt.verify(token.split(' ')[1], process.env.JWTSECRETKEY);
    return true;
  } catch {
    return false;
  }
}
// 토큰 payload 얻기
function getTokenPayload(token) {
  try {
    const payload = jwt.verify(token.split(' ')[1], process.env.JWTSECRETKEY);
    return payload.userId;
  } catch {
    return null;
  }
}
// 파라메터 검증
function parameterVerification(param) {
  const paramRegExp = /^[0-9]*$/;
  return paramRegExp.test(param);
}
// 게시글 작성
router.post('/', async (req, res) => {
  const { title, content } = req.body;
  const { Authorization } = req.cookies;

  if (!req.body) {
    return res.status(412).json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
  }
  if (!title) {
    return res.status(412).json({ errorMessage: '게시글 제목의 형식이 일치하지 않습니다.' });
  }
  if (!content) {
    return res.status(412).json({ errorMessage: '게시글 내용의 형식이 일치하지 않습니다.' });
  }
  if (!Authorization) {
    return res.status(403).json({ errorMessage: '로그인이 필요한 기능입니다.' });
  }
  if (!validateToken(Authorization)) {
    return res.status(403).json({ errorMessage: '전달된 쿠키에서 오류가 발생하였습니다.' });
  }

  // const user = await User.findOne({ where: { userId: getTokenPayload(Authorization) } });
  const user = await User.findByPk(getTokenPayload(Authorization));
  await Post.create({ userId: user.userId, title, content });
  return res.status(201).json({ message: '게시글 작성에 성공하였습니다.' });
});
// 게시글 전체 조회
router.get('/', async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [{
        model: User,
        attributes: ['nickname'],
      }],
      attributes: ['postId', 'userId', 'title', 'createdAt', 'updatedAt'],
    });
    const postsData = JSON.parse(JSON.stringify(posts)).map((row) => ({
      postId: row.postId,
      userId: row.userId,
      nickname: row.User.nickname,
      title: row.title,
      createdAt: new Date(row.createdAt).toLocaleString('ko'),
      updatedAt: new Date(row.updatedAt).toLocaleString('ko'),
    })).reverse();
    res.json({ data: postsData });
  } catch {
    res.status(400).json({ message: '게시글 조회에 실패하였습니다.' });
  }
});
// 게시글 상세 조회
router.get('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const posts = await Post.findAll({
      where: { postId: Number(postId) },
      include: [{
        model: User,
        attributes: ['nickname'],
      }],
      attributes: ['postId', 'userId', 'title', 'content', 'createdAt', 'updatedAt'],
    });

    const postData = JSON.parse(JSON.stringify(posts)).map((row) => ({
      postId: row.postId,
      userId: row.userId,
      nickname: row.User.nickname,
      title: row.title,
      content: row.content,
      createdAt: new Date(row.createdAt).toLocaleString('ko'),
      updatedAt: new Date(row.updatedAt).toLocaleString('ko'),
    }));
    res.json({ data: postData });
  } catch {
    res.status(400).json({ message: '게시글 조회에 실패하였습니다.' });
  }
});
// 게시글 수정
router.put('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, content } = req.body;
    const { Authorization } = req.cookies;

    if (!req.body) {
      return res.status(412).json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
    }
    if (!title) {
      return res.status(412).json({ errorMessage: '게시글 제목의 형식이 일치하지 않습니다.' });
    }
    if (!content) {
      return res.status(412).json({ errorMessage: '게시글 내용의 형식이 일치하지 않습니다.' });
    }
    if (!Authorization) {
      return res.status(403).json({ errorMessage: '로그인이 필요한 기능입니다.' });
    }
    if (!validateToken(Authorization)) {
      return res.status(403).json({ errorMessage: '전달된 쿠키에서 오류가 발생하였습니다.' });
    }

    Post.update(
      {
        title, content,
      },
      {
        where: { postId },
      },
    ).then(() => res.status(200).json({ message: '게시글을 수정하였습니다.' }))
      .catch(() => res.status(401).json({ errorMessage: '게시글이 정상적으로 수정되지 않았습니다.' }));
  } catch {
    return res.status(400).json({ errorMessage: '게시글 수정에 실패하였습니다.' });
  }
  return res.status(777).send('도대체 어떻게 온거야.');
});
// 게시글 삭제
router.delete('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { Authorization } = req.cookies;
    if (!postId) {
      return res.status(404).json({ errorMessage: '게시글이 존재하지 않습니다.' });
    }
    if (!parameterVerification(postId)) {
      return res.status(412).json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
    }
    if (!Authorization) {
      return res.status(403).json({ errorMessage: '로그인이 필요한 기능입니다.' });
    }
    if (!validateToken(Authorization)) {
      return res.status(403).json({ errorMessage: '전달된 쿠키에서 오류가 발생하였습니다.' });
    }
    Post.destroy({
      where: { postId },
    }).then(() => res.status(200).json({ Message: '게시글을 삭제하였습니다.' }))
      .catch(() => res.status(401).json({ errorMessage: '게시글이 정상적으로 삭제되지 않았습니다.' }));
  } catch {
    return res.status(400).json({ errorMessage: '게시글 삭제에 실패하였습니다.' });
  }
});

module.exports = router;
