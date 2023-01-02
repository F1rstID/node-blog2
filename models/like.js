const Sequelize = require('sequelize');

class Like extends Sequelize.Model {
  static initiate(sequelize) {
    Like.init({
      likeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      postId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    }, {
      sequelize,
      timestamps: true,
      modelName: 'Like',
      tableName: 'likes',
      paranoid: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    });
  }

  static associate(db) {
    db.Like.belongsTo(db.User, { foreignKey: 'userId', targetKey: 'userId', onDelete: 'CASCADE' });
    db.Like.belongsTo(db.Post, { foreignKey: 'postId', targetKey: 'postId', onDelete: 'CASCADE' });
  }
}

module.exports = Like;
