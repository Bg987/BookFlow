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
  },
  {
    tableName: "Librarians",
    timestamps: false,
  }
);

module.exports = Librarian;
