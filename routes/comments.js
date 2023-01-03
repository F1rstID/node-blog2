/* eslint-disable consistent-return */
const express = require('express');
const cookieParser = require('cookie-parser');
const { verifyJWT, decodeJWT } = require('../modules/jwt');
const { User, Post, Comment } = require('../models');
require('dotenv').config();

const router = express.Router();
require('dotenv').config();

router.use(cookieParser());
// 댓글 작성
router.post('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { comment } = req.body;
    const { Authorization } = req.cookies;

    if (!Authorization) {
      return res
        .status(403)
        .json({ errorMessage: '로그인이 필요한 기능입니다.' });
    }
    if (!verifyJWT(Authorization, process.env.JWTSECRETKEY)) {
      return res
        .status(403)
        .json({ errorMessage: '전달된 쿠키에서 오류가 발생하였습니다.' });
    }
    if (!comment) {
      return res
        .status(412)
        .json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
    }

    const user = await User.findByPk(decodeJWT(Authorization));
    const post = await Post.findByPk(Number(postId));

    await Comment.create({ userId: user.userId, postId: post.postId, comment });

    return res.status(201).json({ message: '댓글을 작성하였습니다' });
  } catch {
    return res.status(400).json({ message: '댓글 작성에 실패하였습니다.' });
  }
});
// 댓글 목록 조회
router.get('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;

    const comment = await Comment.findAll({
      include: [
        {
          model: User,
          attributes: ['nickname'],
          required: true,
        },
      ],
      where: { postId },
      attributes: ['commentId', 'userId', 'comment', 'createdAt', 'updatedAt'],
    });

    const commentData = JSON.parse(JSON.stringify(comment)).map((row) => ({
      commentId: row.commentId,
      userId: row.userId,
      nickname: row.User.nickname,
      comment: row.comment,
      createdAt: new Date(row.createdAt).toLocaleString('ko'),
      updatedAt: new Date(row.updatedAt).toLocaleString('ko'),
    }));

    res.status(200).json({ data: commentData });
  } catch {
    res.status(400).json({ message: '댓글 조회에 실패하였습니다.' });
  }
});
// 댓글 수정
router.put('/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;
    const { comment } = req.body;
    const { Authorization } = req.cookies;

    const commentData = await Comment.findOne({
      where: { commentId: Number(commentId) },
    });
    if (!comment) {
      return res
        .status(404)
        .json({ errorMessage: '댓글이 존재하지 않습니다.' });
    }
    if (!Authorization) {
      return res
        .status(403)
        .json({ errorMessage: '로그인이 필요한 기능입니다.' });
    }
    if (!verifyJWT(Authorization, process.env.JWTSECRETKEY)) {
      return res
        .status(403)
        .json({ errorMessage: '전달된 쿠키에서 오류가 발생하였습니다.' });
    }
    if (!req.body) {
      return res
        .status(412)
        .json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
    }
    if (decodeJWT(Authorization) !== commentData.userId) {
      return res
        .status(401)
        .json({ errorMessage: '댓글이 정상적으로 수정되지 않았습니다.' });
    }
    await Comment.update(
      {
        comment,
      },
      {
        where: { commentId },
      }
    )
      .then(() => res.status(200).json({ message: '댓글을 수정하였습니다.' }))
      .catch(() =>
        res
          .status(401)
          .json({ errorMessage: '댓글이 정상적으로 수정되지 않았습니다.' })
      );
    // return true;
  } catch {
    return res
      .status(400)
      .json({ errorMessage: '댓글 수정에 실패하였습니다.' });
  }
});
// 댓글 삭제
router.delete('/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;
    const { Authorization } = req.cookies;

    const commentData = await Comment.findOne({
      where: { commentId: Number(commentId) },
    });
    if (!commentData) {
      return res
        .status(404)
        .json({ errorMessage: '댓글이 존재하지 않습니다.' });
    }
    if (!Authorization) {
      return res
        .status(403)
        .json({ errorMessage: '로그인이 필요한 기능입니다.' });
    }
    if (!verifyJWT(Authorization, process.env.JWTSECRETKEY)) {
      return res
        .status(403)
        .json({ errorMessage: '전달된 쿠키에서 오류가 발생하였습니다.' });
    }
    if (decodeJWT(Authorization) !== commentData.userId) {
      return res
        .status(401)
        .json({ errorMessage: '댓글이 정상적으로 삭제되지 않았습니다.' });
    }
    await Comment.destroy({
      where: { commentId },
    })
      .then(() => res.status(200).json({ message: '댓글을 삭제하였습니다.' }))
      .catch(() =>
        res
          .status(401)
          .json({ errorMessage: '댓글이 정상적으로 삭제되지 않았습니다.' })
      );
    // return true;
  } catch {
    return res
      .status(400)
      .json({ errorMessage: '댓글 삭제에 실패하였습니다.' });
  }
});
module.exports = router;
/*
select comments.commentId, comments.postId, comments.comment, users.nickname
from comments
inner join users
*/
