// import { DataTypes, Sequelize } from "sequelize";
// import db from "../connection";
const { DataTypes, Sequelize } = require("sequelize");
const db = require("./../connection");
const User = require("./userModel");
const PemesananDetail = require("./pemesananDetailModel");
const orderDetail = require("./orderDetailModel");

const dataType = Sequelize;

const Pemesanan = db.define(
  "tb_pemesanan",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // id_user: { type: DataTypes.INTEGER },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    waktu_pemesanan: { type: DataTypes.STRING },
    alamat_antar: { type: DataTypes.STRING },
    total_bayar: { type: DataTypes.INTEGER },
    status: {
      type: DataTypes.ENUM,
      values: ["progress", "done"],
    },
  },
  {
    freezeTableName: true,
  }
);

Pemesanan.hasMany(orderDetail, { foreignKey: "id_pemesanan" });
orderDetail.belongsTo(Pemesanan, { foreignKey: "id_pemesanan" });

// export default User;
module.exports = Pemesanan;
// (async () => {
//   await db.sync();
// })();
