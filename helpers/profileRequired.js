/**
 * 근로 시간 CRUD 작업을 수행할 수 있는 조건을 확인하는 미들웨어 입니다.
 */
const models = require('../models');
const dotenv = require('dotenv');
const winston = require('../winston');

dotenv.config();

module.exports = async (req, res, next) => {

    const user = await models.User.findOne({
	where : {
          userID: req.user.userID
	}
    });
    if (!user.stuID ||
	!user.displayname ||
        !user.major ||
        !user.grade ||
        !user.phone ||
        !user.userType ||
        !user.workType ) {
        // res.redirect('/accounts/join');
        res.send('<script>alert("프로필을 전부 작성해야 이 작업을 수행할 수 있습니다.");location.href="/accounts/join";</script>');
    } else {
        return next();
    }
};
