const express = require('express');
const router = express.Router();
const models = require('../models');
const passwordHash = require('../helpers/passwordHash');

router.get('/', (req, res) => {
    res.send('account app');
});

router.get('/join', (req, res) => {
    res.render('accounts/join');
});

router.get('/login', (req, res) => {
    res.render('accounts/login');
});

module.exports = router;