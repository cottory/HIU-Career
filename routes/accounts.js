const express = require('express');
const router = express.Router();
const models = require('../models');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passwordHash = require('../helpers/passwordHash');
const winston = require('../winston');

// csrf 셋팅
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

/**
 * SESSION
 */
passport.serializeUser(  (user, done) => {
    console.log('serializeUser');
    done(null, user);
});

passport.deserializeUser(  (user, done) => {
    const result = user;
    result.password = "";
    console.log('deserializeUser');
    done(null, result);
});

/**
 * SESSION:: 정책 선언
 */
passport.use(new LocalStrategy({
    usernameField: 'stuID',
    passwordField : 'password',
    passReqToCallback : true
}, 
async ( req , stuID , password, done) => {

    // 조회
    const user = await models.User.findOne({
        where: {
            stuID,
            password : passwordHash(password),
        },
        // attributes: { exclude: ['password'] }
    });

    // 유저에서 조회되지 않을시
    if(!user){
        return done(null, false, { message: '일치하는 아이디 패스워드가 존재하지 않습니다.' });

    // 유저에서 조회 되면 세션등록쪽으로 데이터를 넘김
    }else{
        return done(null, user.dataValues );
    }
    
}
));

/**
 * JOIN
 */
router.get('/join', csrfProtection, (req, res) => {
    try {
        res.render('accounts/join', { csrfToken: req.csrfToken()});
    } catch (e) {
        winston.error('at /accounts/join Routing::GET ' + e.message);
    }
});

router.post('/join', csrfProtection, async(req, res) => {
    try{
        var user = await models.User.findOne({
            where: {
                stuID: req.body.stuID
            }
        })
        
        if (user) {
            res.send('<script>alert("이미 가입한 학번입니다.");location.href="/accounts/join";</script>');
        }
        else {
            await models.User.create(req.body);
            res.send('<script>alert("회원가입 성공");location.href="/accounts/login";</script>');
        }
    }catch(e){
        winston.error('at /accounts/join Routing::POST ' + e.message);
    }
});


/**
 * LOGIN
 */
router.get('/login', csrfProtection, (req, res) => {
    try {
        res.render('accounts/login', { flashMessage : req.flash().error, csrfToken: req.csrfToken() });
    } catch (e) {
        winston.error('at /accounts/login Routing:: ' + e.message);
    }
});

router.post('/login' , csrfProtection,
    passport.authenticate('local', { 
        failureRedirect: '/accounts/login', 
        failureFlash: true 
    }),
    ( _ , res) => {
        res.send('<script>alert("로그인 성공");location.href="/";</script>');
    }
);


/**
 * Logout
 */
router.get('/logout', (req, res) => {
    try {
        req.logout();
        res.redirect('/accounts/login');
    } catch (e) {
        winston.error('at /accounts/logout Routing:: ' + e.message);
    }
});

module.exports = router;