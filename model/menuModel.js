// import { DataTypes, Sequelize } from "sequelize";
// import db from "../connection";
const { DataTypes, Sequelize } = require("sequelize");
const db = require("./../connection");
const BestSeller = require("../model/bestSellerModel");
const Favorite = require("../model/favoriteModel");
const PemesananDetail = require("../model/pemesananDetailModel");
const orderDetail = require("./orderDetailModel");

const dataType = Sequelize;

const Menu = db.define(
  "tb_menu",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nama: { type: DataTypes.STRING },
    kategori: {
      type: DataTypes.ENUM,
      values: ["heavy meal", "snack", "drinks", "juice"],
    },
    harga: { type: DataTypes.INTEGER },
    nama_tempat: { type: DataTypes.STRING },
    alamat: { type: DataTypes.STRING },
    kalori: { type: DataTypes.INTEGER },
    gambar: { type: DataTypes.STRING },
  },
  {
    freezeTableName: true,
  }
);

Menu.hasMany(orderDetail, { foreignKey: "id_menu" });
orderDetail.belongsTo(Menu, { foreignKey: "id_menu" });

Menu.hasOne(BestSeller, { foreignKey: "id_menu" });
BestSeller.belongsTo(Menu, { foreignKey: "id_menu" });
// Menu.hasOne(Favorite, { foreignKey: "id_menu" });
// Favorite.belongsTo(Menu, { foreignKey: "id_menu" });

module.exports = Menu;
