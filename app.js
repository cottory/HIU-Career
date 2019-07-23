const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');

const accounts = require('./routes/accounts');
const admin = require('./routes/admin');
const db = require('./models');


/**
 * DB 연결
 */
db.sequelize.authenticate()
.then( () => {
    console.log('Connection has been established successfully.');
    return db.sequelize.sync();
})
.then ( () => {
    console.log('DB Sync complete.');
})
.catch(err => {
    console.error('Unable to connect to the database:', err);
})

/**
 * 
 */
const app = express();
const port = 3000;


/**
 * VIEW 엔진 추가
 * __dirname 값에는 현재 프로젝트 디렉토리까지의 경로가 담겨있습니다.
 */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


/**
 * 
 */
app.use('/admin', admin);
app.use('/accounts', accounts);


/**
 * 
 */
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


/**
 * 
 */
app.get('/', (req, res) => {
    res.send('app');
})

app.listen( port, (req, res) => {
    console.log('Express listening on port', port);
})