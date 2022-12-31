const express = require('express');
const indexRouter = require('./routes/index');
const { sequelize } = require('./models');

const app = express();
const port = 3000;
sequelize.sync({ force: false })
  .then(() => {
    console.log('데이터베이스 연결 성공');
  })
  .catch((err) => {
    console.error(err);
  });

app.use(express.json());
app.use('/', indexRouter);

app.get('/', (req, res) => {
  res.send('<img src="https://4.bp.blogspot.com/--VHhhdaCid8/XdnHV0PMR_I/AAAAAAAmvb0/lTwe3aZyIRwYWZ6w78VIKj78oMbBkxXXgCLcBGAsYHQ/s1600/AW4084199_02.gif">');
});

app.listen(port, () => {
});
