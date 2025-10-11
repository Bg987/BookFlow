const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Librarian = sequelize.define(
  "Librarian",
  {
    librarian_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    lib_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dob: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    profile_pic: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verification_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    verification_token_expire: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "Librarians",
    timestamps: false,
  }
);4444444444

module.exports = Librarian;
