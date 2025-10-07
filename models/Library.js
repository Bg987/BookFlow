const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Library = sequelize.define(
  "Library",
  {
    lib_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    library_name: {
        field: "name",
      type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    founded_year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 7), // precise GPS format
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
    },
      verified: {
        field : "is_verified",
      type: DataTypes.BOOLEAN,
      defaultValue: false, // set false until email verified
    },
    total_members: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    total_books: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    total_librarians: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "Libraries",
    timestamps: false, // since we’re using created_at manually
  }
);

module.exports = Library;
