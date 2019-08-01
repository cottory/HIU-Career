const express = require('express');
const router = express.Router();
const models = require('../models');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const sequelize = require("sequelize");
const Op = sequelize.Op;
const winston = require('../winston');

/**
 * 관리자 페이지 라우팅
 */

/**
 * 근로학생(User)의 명단을 보여줍니다.
 */
router.get('/memberList', csrfProtection, async (req,res) => {

    try {
        const users = await models.User.findAll({
            where : {
                [Op.and]: [ 
                    {stuID: { [Op.ne]: "admin" }},
                    {stuID: { [Op.ne]: "admin2"}}
                ]
                //admin만 사용하는 경우
                // stuID: {
                //     [Op.ne]: "admin"
                // }
            },
            order: [
                ['displayname', 'asc'],
                ['stuID', 'asc']
              ]
        })
        res.render('admin/memberList', { users, csrfToken: req.csrfToken() });
    } catch(e) {
        winston.error('at /admin/memberList Routing:: ' + e.message);
    }

});


/**
 * 근로학생(User)의 명단 중 한 명의 이름을 클릭할 시, 학생의 근로 상세사항을 보여줍니다.
 */
router.get('/memberDetails/:id', csrfProtection, async (req,res) => {

    try {
        const user = await models.User.findOne({
            where : {
              id : req.params.id
            },
            include : [
                'Time'
            ],
            order: [
                [ { model: models.WorkTime, as: 'Time' }, 
                'date',
                'asc'],
                [ { model: models.WorkTime, as: 'Time' }, 
                'start_time',
                'asc']       
              ]
          });   
        res.render('admin/memberDetails', { user, csrfToken: req.csrfToken() });
    } catch (e) {
        winston.error('at /admin/memberDetails/:id Routing:: ' + e.message);
    }
});


/**
 * 관리자는 근로학생 계정을 삭제할 수 있습니다.
 */
router.get('/memberList/delete/:id', async(req, res) => {

    try{
        await models.User.destroy({
            where: {
                id: req.params.id
            }
        });
        res.redirect('/admin/memberList');

    }catch(e){
        winston.error('at /admin/memberList/delete/:id Routing:: ' + e.message);
    }

});


/**
 * 관리자는 학생들의 근로시간을 0으로 초기화 할 수 있습니다. (매 월 초기화 기능)
 */
router.get('/resetTime', async (req, res) => {
    try {
  
        let newTime = 0.0;
        newTime.toFixed(1);
        await models.User.update(
          { 
            time: newTime 
          },
          { 
              where : {} 
          }
        );         
        
        await models.WorkTime.destroy({
            where : {}
        });

        res.send('<script>alert("삭제 되었습니다.");\
        location.href="/admin/memberList";</script>');

    } catch(e) {
        winston.error('at /admin/resetTime Routing:: ' + e.message);
    }
})


module.exports = router;
