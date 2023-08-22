// import { DataTypes, Sequelize } from "sequelize";
// import db from "../connection";
const { DataTypes, Sequelize } = require("sequelize");
const db = require("./../connection");
const Pemesanan = require("./pemesananModel");

const dataType = Sequelize;

const User = db.define(
  "tb_users",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nama: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    divisi: { type: DataTypes.STRING },
    saldo: { type: DataTypes.INTEGER },
    password: { type: DataTypes.STRING },
    role: { type: DataTypes.STRING },
    isVerified: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    freezeTableName: true,
  }
);

User.hasMany(Pemesanan, { foreignKey: "id_user" });
Pemesanan.belongsTo(User, { foreignKey: "id_user" });

// export default User;
module.exports = User;
// (async () => {
//   await db.sync();
// })();
