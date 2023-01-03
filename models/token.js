const Sequelize = require('sequelize');

class Token extends Sequelize.Model {
  static initiate(sequelize) {
    Token.init(
      {
        tokenId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        token: {
          type: Sequelize.STRING,
        },
      },
      {
        sequelize,
        timestamps: true,
        modelName: 'Token',
        tableName: 'tokens',
        paranoid: false,
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
      }
    );
  }

  static associate(db) {
    db.Token.belongsTo(db.User, {
      foreignKey: 'userId',
      targetKey: 'userId',
      onDelete: 'CASCADE',
    });
  }
}

module.exports = Token;
