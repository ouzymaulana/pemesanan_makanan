const { DataTypes, Sequelize } = require("sequelize");
const db = require("./../connection");
const Menu = require("../model/menuModel");
const Pemesanan = require("../model/pemesananModel");

const PemesananDetail = db.define(
  "tb_pemesanan_detail",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_pemesanan: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Pemesanan,
        key: "id",
      },
    },
    // id_menu: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: "tb_menu",
    //     key: "id",
    //   },
    // },
    quantity: { type: DataTypes.INTEGER },
    catatan: { type: DataTypes.STRING },
    subTotal: { type: DataTypes.INTEGER },
  },
  {
    freezeTableName: true,
  }
);

module.exports = PemesananDetail;
