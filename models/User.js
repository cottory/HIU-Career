const passwordHash = require('../helpers/passwordHash')

/**
 * 근로 학생 1명의 속성을 나타내는 User Model
 * 학생은 학번/ 이름/ 소속학과/ 학년/ 전화번호/ 봉사분야/ 누계 속성을 가지고 있습니다.
 * User Model : WorkTime Model = 1: N의 관계
 */
module.exports = function( sequelize, DataTypes) {
        const User = sequelize.define('User', {      
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            stuID: { type: DataTypes.STRING, 
                // allowNull: true,
                unique: true,
                validate : {
                    len : [5, 7]
                }
            },  //학번
            userID: { type: DataTypes.STRING },   //카카오ID
            password: { type: DataTypes.STRING },
            displayname: { type: DataTypes.STRING },   //이름
            major: { type: DataTypes.STRING },  //소속학과
            grade: { type: DataTypes.INTEGER }, //학년
            phone: { type: DataTypes.STRING },  //전화번호
            userType: { type: DataTypes.STRING },   //근로 유형
            workType: {type: DataTypes.STRING},    //봉사 분야
            time: { type: DataTypes.FLOAT }  //누계
        },{
            tableName: 'User',
            charsest: 'utf8',
            collate: 'utf8_general_ci',
        }
    );

    User.associate = (models) => {
        
        //Work 모델에 외래키 걸기
        User.hasMany(
            models.WorkTime, 
            { 
                as: 'Time', 
                foreignKey: 'user_id', 
                sourceKey: 'id', 
                onDelete: 'CASCADE'
            }
        );

    };

    User.beforeCreate((user, _) => {
        user.time = 0.0;
        user.password = passwordHash(user.password);
    })

    return User;
}

