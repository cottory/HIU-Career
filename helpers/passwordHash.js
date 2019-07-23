//passwordHash.js
const crypto = require('crypto');
const mysalt = "nerguri";

module.exports = function (password) {  
  return crypto.createHash('sha512').update(password + mysalt).digest('base64');
};

//return crypto.createHash('sha512').update(password + mysalt).digest('base64');
//sha512가 base64범위 안에서 암호화를 한다.