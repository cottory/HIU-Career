const passwordHash = require('../helpers/passwordHash')

module.exports = function( sequelize, DataTypes) {
        const User = sequelize.define('User', {      
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            stuID: { type: DataTypes.STRING,
                validate : {
                    len : [7, 7]
                },
                allowNull : false
            },  //학번
            password: { type: DataTypes.STRING },
            displayname: { type: DataTypes.STRING },   //이름
            userType: { type: DataTypes.STRING },   //근로 유형
            major: { type: DataTypes.STRING },  //소속학과
            grade: { type: DataTypes.INTEGER }, //학년
            phone: { type: DataTypes.STRING },  //전화번호
        },{
            tableName: 'User'
        }
    );

    User.beforeCreate((user, _) => {
        user.password = passwordHash(user.password);
    })

    return User;
}

