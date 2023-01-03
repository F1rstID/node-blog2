const express = require('express');
const postsRouter = require('./posts');
const signUpRouter = require('./signup');
const loginRouter = require('./login');
const commentsRouter = require('./comments');
const likesRouter = require('./likes');

const router = express.Router();
router.use('/login', loginRouter);
// const middleware = require('../middleware/validateToken');

// router.use(middleware);
router.use('/posts', likesRouter, postsRouter);
router.use('/signup', signUpRouter);
router.use('/comments', commentsRouter);

module.exports = router;
