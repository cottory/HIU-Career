/**
 * index.js 에서는 sequelize설정, 그 외 js 파일에는 Table에 대한 정의가 들어가 있습니다.
 */

const path = require('path');
const fs = require('fs');
const Sequelize = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize( process.env.DATABASE,
    process.env.DB_USER, process.env.DB_PASSWORD, {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        timezone: '+09:00',
        operatorsAliases: Sequelize.Op,
        
        //single process 생성
        pool: {
            max: 5,
            min: 0,
            idle: 10000
        }, 
        define: {
            timestamps: false,  //creat_at, update_at 컬럼 생성 x
        }
});

let db = [];

// models 폴더의 파일들을 모두 읽어서 db변수에 연결합니다.

// 이렇게 작업 하면 models/index.js로부터 캐쉬된 객체들을 가져올 수 있습니다. 
// 서버가 구동될때 단 한번 import를 하면 다음은 require로 가져다 쓰기만 하면 됩니다.
fs.readdirSync(__dirname)
    .filter(file => {
        return file.indexOf ('.js')&& file !== 'index.js'
    })
    .forEach(file => {
        var model = sequelize.import(path.join(__dirname,
            file));
            db[model.name] = model;
    });

Object.keys(db).forEach(modelName => {
    if("associate" in db[modelName]){
        db[modelName].associate(db);
    }
});

db.Sequelize = Sequelize;
db.sequelize = sequelize;

module.exports = db;