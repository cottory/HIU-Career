const express = require('express');
const router = express.Router();
const models = require('../models');
const profileRequired = require('../helpers/profileRequired');
const passwordHash = require('../helpers/passwordHash');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const passport = require('passport');
const fs = require('fs');
const appRoot = require('app-root-path');
const winston = require('../winston');


passport.serializeUser(function(user, done) {
    done(null, user);
});
  
passport.deserializeUser(function(user,done) {
    done(null, user); 
});


/**
 * User 한 명의 프로필을 보여줍니다.
 */
router.get('/', csrfProtection, async (req,res) => {
    try {
      var user = await models.User.findOne({
        where : { id: req.user.id }
      })
      res.render('profile/index', { user, csrfToken: req.csrfToken() });

    } catch (e) {
      winston.error('at /profile Routing:: ' + e.message);
    }
    
});
  

/**
 * 프로필 수정화면을 보여줍니다.
 */
router.get('/edit', csrfProtection, (req,res) => {
    try {
      res.render('profile/form', { user: req.user, csrfToken: req.csrfToken() });
    } catch (e) {
      winston.error('at /profile/edit Routing::GET ' + e.message);
    }
});
 
router.post('/edit', csrfProtection, async(req,res) => {
    
    try {

      if (!req.body.stuID) {
        req.body.stuID = req.user.stuID;
      }
      if (!req.body.major) {
        req.body.major = req.user.major;
      }
      if (!req.body.grade) {
        req.body.grade = req.user.grade;
      }
      if (!req.body.phone) {
        req.body.phone = req.user.phone;
      }
      if (!req.body.userType) {
        req.body.userType = req.user.userType;
      }
      if (!req.body.workType) {
        req.body.workType = req.user.workType;
      }

      if (req.body.password) {
        req.body.password = passwordHash(req.body.password);
      } else {
        req.body.password = req.user.password;
      }
      
      await models.User.update(
          req.body, 
          { 
              where: { id: req.user.id }
          }
      )

      var user = await models.User.findOne({
          where : { id: req.user.id }
      })
    
      req.login(user, () => {
        res.redirect('/profile');
      });
  
    } catch(e) {
      winston.error('at /profile/edit Routing::POST ' + e.message);
      throw(e);
    }
  
});
  

/**
 * 회원탈퇴 클릭 시 동작하는 라우팅입니다.
 */
router.get('/delete/:id', async(req, res) => {
  try{
    await models.User.destroy({
        where: {
            id: req.params.id
        }
    });
    req.logout();
    res.redirect('/accounts/login');

}catch(e){
  winston.error('at /profile/delete/:id Routing:: ' + e.message);
}
});


/**
 * User의 디폴트 라우팅 화면으로써, User의 모든 근로시간 상황을 보여줍니다.
 */
router.get('/workTimes', csrfProtection, async(req,res) => {
 
  try {

      const user = await models.User.findOne({
        where : {
          id : req.user.id
        },
        include : [
          'Time'
        ],
        order: [
          [ { model: models.WorkTime, as: 'Time' }, 
            'date',
            'asc'
          ],
          [ { model: models.WorkTime, as: 'Time' }, 
            'start_time',
            'asc'
          ]       
        ]
      });    
      
      res.render('profile/workTimes', { user, csrfToken: req.csrfToken()});

  } catch (e) {
    winston.error('at /profile/workTimes Routing:: ' + e.message);
  }

});


/**
 * 근로시간 등록 화면을 처리하는 라우팅입니다.
 */
router.get('/workTimes/write', csrfProtection, profileRequired, async(req, res) => {
  try {
    res.render('profile/workTimeform', { workTime: "", csrfToken: req.csrfToken() });

  } catch (e) {
    winston.error('at /profile/workTimes/write Routing::GET ' + e.message);
  }
});

router.post('/workTimes/write', csrfProtection, profileRequired, async(req, res) => {
    try {

        const user = await models.User.findByPk(req.user.id);

        const query = await models.WorkTime.findOne({
          where : {
            start_time: req.body.start_time,
            date: req.body.date,
            user_id: req.user.id
          }
        })

        const query2 = await models.WorkTime.findOne({
          where : {
            end_time: req.body.end_time,
            date: req.body.date,
            user_id: req.user.id
          }
        })

        if (query || query2) {
          res.send('<script>alert("이미 등록된 (날짜-시간) 쌍입니다.");location.href="/profile/workTimes/write";</script>');
        }
        else {
            await user.createTime(req.body);

            user.time += parseFloat(req.body.time);
            let newTime = user.time.toFixed(1);
            await models.User.update(
              { 
                time: newTime 
              },
              { 
                  where : { id: req.user.id } 
              }
            );
          
            res.send('<script>alert("시간등록 완료");location.href="/profile/workTimes";</script>');
        }
      
    } catch (e) {
      winston.error('at /profile/workTimes/write Routing::POST ' + e.message);
    }
});


/**
 * 이미 등록한 근로시간을 수정할 수 있는 화면을 보여줍니다.
 */
router.get('/workTimes/edit/:id', csrfProtection, profileRequired, async(req, res) => {

  try{
      const workTime = await models.WorkTime.findByPk(req.params.id);
      res.render('profile/workTimeform', { workTime, csrfToken: req.csrfToken() });  

  }catch(e){
    winston.error('at /profile/workTimes/edit/:id Routing::GET ' + e.message);
  }
  
});

router.post('/workTimes/edit/:id', csrfProtection , profileRequired, async(req, res) => {

  try{
      const workTime = await models.WorkTime.findByPk(req.params.id);
      const user = await models.User.findByPk(req.user.id);

      const query = await models.WorkTime.findOne({
        where : {
          start_time: req.body.start_time,
          date: req.body.date,
          user_id: req.user.id
        }
      })

      const query2 = await models.WorkTime.findOne({
        where : {
          end_time: req.body.end_time,
          date: req.body.date,
          user_id: req.user.id
        }
      })
      
      if (query || query2) {
        res.send('<script>alert("이미 등록된 (날짜-시간) 쌍입니다.");location.href="/profile/workTimes";</script>');
      }
      else {

          await models.WorkTime.update(
              req.body, 
              { 
                  where : { id: req.params.id } 
              }
          );

          let prevWorkTime, curWorkTime, newTime;
          prevWorkTime = workTime.time;
          curWorkTime = parseFloat(req.body.time);

          newTime = user.time - prevWorkTime + curWorkTime;
          newTime.toFixed(1);
          await models.User.update(
            { 
              time: newTime 
            },
            { 
                where : { id: req.user.id } 
            }
          );

          res.redirect('/profile/workTimes');
      }

  }catch(e){
    winston.error('at /profile/workTimes/edit/:id Routing::POST ' + e.message);
  }

});


/**
 * 등록한 근로시간 삭제를 처리하는 라우팅입니다.
 */
router.get('/workTimes/delete/:id', profileRequired, async(req, res) => {
  
  try{
      
      const workTime = await models.WorkTime.findByPk(req.params.id);
      const user = await models.User.findByPk(req.user.id);

      let newTime = user.time - workTime.time;
      newTime.toFixed(1);
      await models.WorkTime.destroy({
        where : {
          id : req.params.id
        }
      });

      await models.User.update(
        { 
          time: newTime 
        },
        { 
            where : { id: req.user.id } 
        }
      );

      res.redirect('/profile/workTimes');

  }catch(e){
    winston.error('at /profile/workTimes/delete/:id Routing:: ' + e.message);
  }
});


/**
 * '시간표 생성' 로직을 처리하는 라우팅입니다. docx 파일을 생성합니다.
 */
router.get('/workTimes/print/:id', profileRequired, async (req, res) => {

  try {

    const user = await models.User.findOne({
      where : {
        id : req.user.id
      },
      include : [
        'Time'
      ],
      order: [
        [ { model: models.WorkTime, as: 'Time' }, 
          'date',
          'asc'
        ],
        [ { model: models.WorkTime, as: 'Time' }, 
          'start_time',
          'asc'
        ]       
      ]
    });    
  
    const time_size = user.Time.length;
    let user_information = [user.stuID, user.displayname, user.major, user.grade, user.userType, user.workType, user.time];
    let user_time = Array(user.Time.length).fill(null).map(() => Array());
    let _date = new Date();
    let year = _date.getFullYear();
    let month = _date.getMonth() + 1;
    let date = [year, month];

    loop = 0;
    totalTime = 0;
    user_time.forEach((timeToken) => {
      timeToken.push(user.Time[loop].date);
      timeToken.push(user.Time[loop].dayOfWeek);
      timeToken.push(user.Time[loop].start_time);
      timeToken.push(user.Time[loop].end_time);
      timeToken.push(user.workType);
      timeToken.push(user.Time[loop].time);
  
      //누계 계산
      totalTime += user.Time[loop].time;
      timeToken.push(totalTime);
      timeToken.push("(인)");
      timeToken.push("(인)");
      timeToken.push("(인)");
      loop++;
    })
    
    let docxCodePath = appRoot.path + '/common/createDocx.py'

    var spawn = require("child_process").spawn; 
    var process = spawn('python',[docxCodePath, user_information, user_time, time_size, date, appRoot.path]); 
    
    process.stdout.on('data', function(data) { 
      res.redirect('/profile/success');
    });

  } catch(e) {
    winston.error('at /profile/workTimes/print/:id Routing:: ' + e.message);
  }
  
});


/**
 * '시간표 생성' 라우팅이 정상 처리 됐을 시 나타나는 화면이며, 다운로드 화면을 보여줍니다.
 */
router.get('/success', profileRequired, ( _, res) => {
  try {
    res.render('profile/success');
  } catch (e) {
    winston.error('at /profile/success Routing:: ' + e.message); 
  }
});


/**
 * 다운로드 로직을 처리하는 라우팅입니다. 서버에 저장된 .docx를 사용자가 다운로드 할 수 있습니다.
 */
router.get('/workTimes/download', profileRequired, (req, res) => {

  try {
    
      filePath = ""
      filePath += req.user.stuID;
      filePath += ".docx"
      let docxFilePath = appRoot.path + '/uploads/' + filePath;

      fs.readFile(docxFilePath, (err, data) => {
        if (err) {
	        winston.error('at /profile/workTimes/download Routing in fs.readFile logic:: ' + err.message);
        } else {
          res.writeHead(200, {"Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"});
          res.write(data);
          res.end();
        }
      });
  } catch (e) {
    	    winston.error('at /profile/workTimes/download Routing:: ' + e.message);
  }
  
});

module.exports = router;
