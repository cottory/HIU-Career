const express = require('express');
const router = express.Router();
const winston = require('../winston');

/**
 * 시스템의 첫 라우팅을 관리합니다.
 */
router.get('/', async ( req ,res) => {
    try {
        if (req.user === undefined) {
            res.redirect('/accounts/login');
        } else if (req.user.stuID === 'admin' || req.user.stuID === 'admin2') {
            res.redirect('/admin/memberList');
        } else {
            res.redirect('/profile/workTimes');
        }
    } catch (e) {
        winston.error('at / Routing:: ' + e.message);
    }

});

module.exports = router;