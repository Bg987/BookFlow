// models/LibraryRequest.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const LibraryRequest = sequelize.define(
  "LibraryRequest",
  {
    request_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    member_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    library_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    action_by: {
      type: DataTypes.STRING, // stores id of librarian or library who handled the request
      allowNull: true,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: true, // for rejection reason
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    indexes: [
      {
        name: "idx_library_id",
        fields: ["library_id"],
      },
    ],
  }
);

module.exports = LibraryRequest;
