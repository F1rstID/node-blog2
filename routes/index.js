const express = require('express');
const postsRouter = require('./posts');
const signUpRouter = require('./sginup');
const loginRouter = require('./login');
const commentsRouter = require('./comments');
const likesRouter = require('./likes');

const router = express.Router();

router.use('/posts', [postsRouter, likesRouter]);
router.use('/signup', signUpRouter);
router.use('/login', loginRouter);
router.use('/comments', commentsRouter);

module.exports = router;
