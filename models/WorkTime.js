/**
 * 한 번의 근무 시간을 나타내는 WorkTime Model
 * 한 번의 근로 시간은 날짜/ 요일 / 시작시간 - 종료시간 / 계의 속성을 가지고 있습니다.
 * User Model : WorkTime Model = 1: N의 관계
 */
module.exports = function( sequelize, DataTypes) {
        const WorkTime = sequelize.define('WorkTime', {      
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            date: { type: DataTypes.STRING },  // 월/일
            dayOfWeek: { type: DataTypes.STRING },   // 요일
            start_time: { type: DataTypes.STRING },   // 근로 시작 시간
            end_time: { type: DataTypes.STRING },  // 근로 종료 시간
            time: { type: DataTypes.FLOAT }, // 계
        },{
            tableName: 'WorkTime',
            charsest: 'utf8',
            collate: 'utf8_general_ci',
        }
    );

    WorkTime.associate = (models) => {
        WorkTime.belongsTo(models.User, { as: 'Owner', foreignKey: 'user_id', targetKey: 'id'} );
    }

    return WorkTime;
}