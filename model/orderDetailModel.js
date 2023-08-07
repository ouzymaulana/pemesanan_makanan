const { DataTypes, Sequelize } = require("sequelize");
const Menu = require("../model/menuModel");
const db = require("./../connection");
const Pemesanan = require("../model/pemesananModel");

const orderDetail = db.define(
  "tb_order_detail",
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
    id_menu: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Menu,
        key: "id",
      },
    },
    quantity: { type: DataTypes.INTEGER },
    catatan: { type: DataTypes.STRING },
    subTotal: { type: DataTypes.INTEGER },
  },
  {
    freezeTableName: true,
  }
);

module.exports = orderDetail;
