const express = require('express');
const router = express.Router();
const passport = require('passport');
const KakaoStrategy = require("passport-kakao").Strategy;
const winston = require('../winston');

const models = require('../models');
const dotenv = require('dotenv');
dotenv.config();

const kakaoKey = {
    clientID: process.env.KAKAO_APPID,
    callbackURL: `${process.env.SITE_DOMAIN}/auth/kakao/callback`,
};

passport.serializeUser( (user, done) => {
    done(null, user);
});
 
passport.deserializeUser( (user, done) => {
    done(null, user);
});

passport.use("kakao-login", 
  new KakaoStrategy(kakaoKey, async (accessToken, refreshToken, profile, done) => {

    try {
        const kakaoID = `kakao_${profile.id}`;

        //존재하는지 check
        const exist = await models.User.findOne({
            where: {
                userID: kakaoID
            }
        });

        if (!exist){

            //존재하면 바로 세션에 등록
            user = await models.User.create({
                userID: kakaoID
            });
        } else {
            user = await models.User.findOne({
                where: { 
                     userID: kakaoID
                }
            });
        }

        return done(null, user);

    } catch(e) {
        winston.error('at passport.use("kakao-login" new KakaoStrategy) ' + e.message);
    }
  }
));

//지정된 URL로 접근 시 kakao로 넘길 URL를 작성해줍니다.
router.get("/kakao", passport.authenticate("kakao-login"));


/**
 * 인증 후 카카오에서 이 주소로 리턴을 해줍니다. 상단에 적은 callbackURI와 일치합니다. 
 */
router.get("/kakao/callback", 
  passport.authenticate("kakao-login", {
      successRedirect: "/auth/kakao/success",
      failureRedirect: '/auth/kakao/fail'
  })
);


/**
 * 카카오 로그인 성공 시 이동할 주소 라우팅 
 */
router.get('/kakao/success', async (req, res) => {

    try {
        const user = await models.User.findOne({
            where : { id: req.user.id }
        })

        if (!user.stuID ||
            !user.displayname ||
            !user.major ||
            !user.grade ||
            !user.phone ||
            !user.userType ||
            !user.workType ) {
            res.redirect('/accounts/join');
        } else {
            res.redirect('/');
        }

    } catch (e) {
        winston.error('at /auth/kakao/success ' + e.message);
    }
});


/**
 * 카카오 로그인 실패 시 이동할 주소 라우팅
 */
router.get('/kakao/fail', (req, res) => {

    try {
        res.send('<script>alert("카카오 로그인에 실패했습니다.");location.href="/accounts/login";</script>');
    } catch (e) {
        winston.error('at /auth/kakao/fail ' + e.message);
    }
});

module.exports = router;
