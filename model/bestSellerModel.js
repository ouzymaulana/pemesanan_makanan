const { DataTypes, Sequelize } = require("sequelize");
const Menu = require("../model/menuModel");
const db = require("./../connection");

const BestSeller = db.define(
  "tb_best_seller",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // id_menu: { type: DataTypes.INTEGER },
    id_menu: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Menu,
        key: "id",
      },
    },
    quantity: { type: DataTypes.INTEGER },
  },
  {
    freezeTableName: true,
  }
);

module.exports = BestSeller;
