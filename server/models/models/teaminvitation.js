const simplecrypt = require("simplecrypt");

const settings = process.env.NODE_ENV === "production" ? require("../../settings") : require("../../settings-dev");

const sc = simplecrypt({
  password: settings.secret,
  salt: "10",
});

module.exports = (sequelize, DataTypes) => {
  const TeamInvitation = sequelize.define("TeamInvitation", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      reference: {
        model: "User",
        key: "id",
        onDelete: "cascade",
      },
    },
    team_id: {
      type: DataTypes.INTEGER,
      reference: {
        model: "Team",
        key: "id",
        onDelete: "cascade",
      },
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      get() {
        try {
          return sc.decrypt(this.getDataValue("email"));
        } catch (e) {
          return this.getDataValue("email");
        }
      },
      set(value) {
        return this.setDataValue("email", sc.encrypt(value));
      },
    },
  }, {
    freezeTableName: true,
  });

  TeamInvitation.associate = (models) => {
    models.TeamInvitation.belongsTo(models.Team, { foreignKey: "team_id" });
  };

  return TeamInvitation;
};
