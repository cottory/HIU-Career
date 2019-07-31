module.exports = function(req, res, next) {
    if (!req.isAuthenticated()){ 
        res.redirect('/accounts/login');
    }else{
        if((req.user.stuID==='admin') || (req.user.stuID==='admin2')){
            return next();
        }else{
            res.send('<script>alert("관리자만 접근가능합니다.");\
            location.href="/accounts/login";</script>');
        }
    }
};