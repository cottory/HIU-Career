const express = require('express');
const router = express.Router();

router.get('/', (_,res) => {
    res.send('admin page');
})

module.exports = router;

