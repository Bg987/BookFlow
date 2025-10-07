// config/db.js
const { Sequelize } = require("sequelize");
const mongoose = require("mongoose");
require("dotenv").config();

// ---------- MySQL (TiDB) CONFIG ----------
const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: "mysql",
  dialectOptions: {
    ssl: {
      rejectUnauthorized: true, // TiDB requires secure connection
    },
  },
  logging: false, // disable SQL logging in console
});

// ---------- MongoDB CONFIG ----------
const connectMongoDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected:`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

// ---------- Test MySQL connection ----------
async function testDBConnection() {
  try {
    await sequelize.authenticate();
    console.log("MySQL Database connected successfully");
  } catch (error) {
    console.error("MySQL Database connection failed:", error.message);
    process.exit(1);
  }
}

module.exports = { sequelize, testDBConnection, connectMongoDB };
