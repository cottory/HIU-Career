const express = require('express');
const logger = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');  
const flash = require('connect-flash');
 
//passport 로그인 관련
const passport = require('passport');
const session = require('express-session');

const accounts = require('./routes/accounts');
const admin = require('./routes/admin');
const db = require('./models');

/**
 * DB 연결
 */
db.sequelize.authenticate()
.then( () => {
    console.log('Connection has been established successfully.');
    return db.sequelize.drop();
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
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


//session 관련 셋팅
app.use(session({
    secret: 'nerguri',
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 2000 * 60 * 60 //지속시간 2시간
    }
}));

//passport 적용
app.use(passport.initialize());
app.use(passport.session());

//플래시 메시지 관련
app.use(flash());

/**
 * 
 */
app.get('/', (req, res) => {
    res.send('app');
})

/**
 * 
 */
app.use('/admin', admin);
app.use('/accounts', accounts);

app.listen( port, (req, res) => {
    console.log('Express listening on port', port);
})