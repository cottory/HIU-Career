const express = require('express');
const logger = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');  
const flash = require('connect-flash');

//passport 로그인 관련
const passport = require('passport');
const session = require('express-session');
const dotenv = require('dotenv');

dotenv.config();

const db = require('./models');


/**
 * DB 연결
 */
db.sequelize.authenticate()
.then( () => {
    console.log('Connection has been established successfully.');
    return db.sequelize.sync();
    // return db.sequelize.drop();
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
const accounts = require('./routes/accounts');
const admin = require('./routes/admin');
const home = require('./routes/home');
const profile = require('./routes/profile');
const loginRequired = require('./helpers/loginRequired');
const adminRequired = require('./helpers/adminRequired');


/**
 * 
 */
const app = express();
const port = process.env.PORT_NUMBER;


/**
 * VIEW 엔진 추가
 */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/**
 * Middleware setting
 */
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//session 관련 셋팅
app.use(session({
    secret: process.env.SESSION_SECRET,
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
 * 뷰에서만 글로벌로 사용할수 있는 변수 셋팅. 로그인 정보 뷰에서만 변수로 셋팅.
 */
app.use(function(req, res, next) {
    app.locals.isLogin = req.isAuthenticated();
    //app.locals.urlparameter = req.url; //현재 url 정보를 보내고 싶으면 이와같이 셋팅
    app.locals.userData = req.user; //사용 정보를 보내고 싶으면 이와같이 셋팅

    //view에서 '누계'를 표현하기 위한 변수: totalTime
    app.locals.totalTime = parseFloat(0);
    next();
});


/**
 * 
 */
app.use('/', home);
app.use('/accounts', accounts);
app.use('/admin', adminRequired, admin);
app.use('/profile', loginRequired, profile);


/**
 * 함수 호출이 일어난 곳을 추적하는 Logger
 */
(function() {
    var childProcess = require("child_process");
    var oldSpawn = childProcess.spawn;
    function mySpawn() {
        console.log('spawn called');
        console.log(arguments);
        var result = oldSpawn.apply(this, arguments);
        return result;
    }
    childProcess.spawn = mySpawn;
})();

app.listen( port, () => {
    console.log('Express listening on port', port);
})
