/* eslint-disable consistent-return */
const cookieParser = require('cookie-parser');
const express = require('express');
const { User, Post, Like } = require('../models');
const { verifyJWT, decodeJWT } = require('../modules/jwt');
const { parameterVerification } = require('../modules/parameter');
require('dotenv').config();

const router = express.Router();

router.use(cookieParser());

// 게시글 작성
router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body;
    const { Authorization } = req.cookies;
    // res.locals.user ??
    // console.log(res.locals.user);

    // console.log(res.locals.Authorization);

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
    if (!verifyJWT(Authorization, process.env.JWTSECRETKEY)) {
      return res.status(403).json({ errorMessage: '전달된 쿠키에서 오류가 발생하였습니다.' });
    }
    // const user = await User.findOne({ where: { userId: getTokenPayload(Authorization) } });
    const { userId } = await User.findByPk(decodeJWT(Authorization, process.env.JWTSECRETKEY));

    await Post.create({ userId, title, content });
    return res.status(201).json({ message: '게시글 작성에 성공하였습니다.' });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: '게시글 작성에 실패하였습니다.' });
  }
});
// 게시글 전체 조회
router.get('/', async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [{
        model: User,
        attributes: ['nickname'],
        required: true,
      },
      {
        model: Like,
        required: false,
      },
      ],
      attributes: ['postId', 'userId', 'title', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'desc']],
      // row: true,
    });
    // console.log(JSON.parse(JSON.stringify(posts)));
    // sql slect * from talble , table2,
    const postsData = JSON.parse(JSON.stringify(posts)).map((row) => ({
      postId: row.postId,
      userId: row.userId,
      nickname: row.User.nickname,
      title: row.title,
      createdAt: new Date(row.createdAt).toLocaleString('ko'),
      updatedAt: new Date(row.updatedAt).toLocaleString('ko'),
      likes: row.Likes.length,
    }));

    res.json({ data: postsData });
  } catch (err) {
    res.status(400).json({ errorMessage: '게시글 조회에 실패하였습니다.' });
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
    res.status(200).json({ data: postData });
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
    const post = await Post.findOne({ where: { postId: Number(postId) } });

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
    if (!verifyJWT(Authorization, process.env.JWTSECRETKEY)) {
      return res.status(403).json({ errorMessage: '전달된 쿠키에서 오류가 발생하였습니다.' });
    }
    if (decodeJWT(Authorization) !== post.userId) {
      return res.status(401).json({ errorMessage: '게시글이 정상적으로 수정되지 않았습니다.' });
    }
    await Post.update(
      {
        title, content,
      },
      {
        where: { postId },
      },
    ).then(() => res.status(200).json({ message: '게시글을 수정하였습니다.' }))
      .catch(() => res.status(401).json({ errorMessage: '게시글이 정상적으로 수정되지 않았습니다.' }));
    // return true;
  } catch (e) {
    return res.status(400).json({ errorMessage: '게시글 수정에 실패하였습니다.' });
  }
});
// 게시글 삭제
router.delete('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { Authorization } = req.cookies;
    const post = await Post.findOne({ where: { postId: Number(postId) } });

    if (!post) {
      return res.status(404).json({ errorMessage: '게시글이 존재하지 않습니다.' });
    }
    if (!parameterVerification(postId)) {
      return res.status(412).json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
    }
    if (!Authorization) {
      return res.status(403).json({ errorMessage: '로그인이 필요한 기능입니다.' });
    }
    if (!verifyJWT(Authorization, process.env.JWTSECRETKEY)) {
      return res.status(403).json({ errorMessage: '전달된 쿠키에서 오류가 발생하였습니다.' });
    }
    if (decodeJWT(Authorization) !== post.userId) {
      return res.status(401).json({ errorMessage: '게시글이 정상적으로 삭제되지 않았습니다.' });
    }
    await Post.destroy({
      where: { postId },
    }).then(() => res.status(200).json({ Message: '게시글을 삭제하였습니다.' }))
      .catch(() => res.status(401).json({ errorMessage: '게시글이 정상적으로 삭제되지 않았습니다.' }));
    return true;
  } catch {
    return res.status(400).json({ errorMessage: '게시글 삭제에 실패하였습니다.' });
  }
});

module.exports = router;

// 게시글 없어도 삭제가 계속됨.
// 삭제 권한 한정
