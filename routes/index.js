const express = require('express');
const postsRouter = require('./posts');
const signUpRouter = require('./sginup');
const loginRouter = require('./login');

const router = express.Router();

router.use('/posts', postsRouter);
router.use('/signup', signUpRouter);
router.use('/login', loginRouter);

module.exports = router;
