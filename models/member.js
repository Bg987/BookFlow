const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Member = sequelize.define(
  "Member",
  {
    member_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    lib_id: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
      index: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 100],
      },
    },
    dob: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
      index: true,
    },
  },
  {
    tableName: "Members",
    timestamps: false,
    indexes: [{ fields: ["lib_id"] }, { fields: ["city"] }],
  }
);

module.exports = Member;
