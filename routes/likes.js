/* eslint-disable consistent-return */
const express = require('express');
const cookieParser = require('cookie-parser');
const { Post, Like } = require('../models');
const { decodeJWT } = require('../modules/jwt');

const router = express.Router();
require('dotenv').config();

router.use(cookieParser());

router.put('/:postId/like', async (req, res) => {
  const { postId } = req.params;
  const { Authorization } = req.cookies;
  const userId = decodeJWT(Authorization);
  const like = await Like.findOne({ where: { postId, userId } });
  const post = await Post.findByPk(Number(postId));
  if (!post) {
    return res
      .status(404)
      .json({ errorMessage: '게시글이 존재하지 않습니다..' });
  }
  if (!Authorization) {
    return res
      .status(403)
      .json({ errorMessage: '로그인이 필요한 기능입니다.' });
  }

  if (like) {
    // 좋아요 되어 있을때 -> 좋아요 취소하기
    await Like.destroy({
      where: { likeId: like.likeId, postId, userId },
    })
      .then(() =>
        res.status(200).json({ Message: '게시글의 좋아요를 취소하였습니다.' })
      )
      .catch(() =>
        res
          .status(401)
          .json({ errorMessage: '게시글의 좋아요가 취소되지 않았습니다.' })
      );
  }
  if (!like) {
    // 좋아요 안되어 있을때 -> 좋아요 누르기
    await Like.create({ userId, postId })
      .then(() =>
        res.status(200).json({ Message: '게시글의 좋아요를 등록하였습니다.' })
      )
      .catch(() =>
        res
          .status(401)
          .json({ errorMessage: '게시글의 좋아요가 등록되지 않았습니다.' })
      );
  }
});

module.exports = router;
