// config/db.js
const { Sequelize } = require("sequelize");
const mongoose = require("mongoose");
require("dotenv").config();

const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: "mysql",
  dialectOptions: {
    ssl: {
      rejectUnauthorized: true, 
    },
  },
  logging: false,
});


const connectMongoDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL, {
    });
    console.log(`MongoDB connected:`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

async function testDBConnection() {
  try {
    await sequelize.authenticate();
    console.log("MySQL Database connected successfully");
    //to sync change in sql dbs
    // await sequelize
    //   .sync({ alter: true }) 
    //   .then(() => console.log("Database & tables synced!"))
    //   .catch((err) => console.error("Error syncing database:", err));
  } catch (error) {
    console.error("MySQL Database connection failed:", error.message);
    process.exit(1);
  }
}

module.exports = { sequelize, testDBConnection, connectMongoDB };
