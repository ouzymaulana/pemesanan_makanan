const mysql = require("mysql");
// import { Sequelize } from "sequelize";
const Sequelize = require("sequelize");

const db = new Sequelize("spe_food_ordering", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

// export default db;

// const db = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "spe_food_ordering",
// });

module.exports = db;
