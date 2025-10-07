// config/db.js
const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: "mysql",
  dialectOptions: {
    ssl: {
      rejectUnauthorized: true, // TiDB requires secure connection
    },
  },
  logging: false, // disable SQL logging in console
});

async function testDBConnection() {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, testDBConnection };
