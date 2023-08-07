// import { DataTypes, Sequelize } from "sequelize";
// import db from "../connection";
const { DataTypes, Sequelize } = require("sequelize");
const db = require("./../connection");

const Cart = db.define(
  "tb_cart",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_user: { type: DataTypes.INTEGER },
    id_menu: { type: DataTypes.INTEGER },
    quantity: { type: DataTypes.INTEGER },
    catatan: { type: DataTypes.STRING },
  },
  {
    freezeTableName: true,
  }
);

// export default User;
module.exports = Cart;
// (async () => {
//   await Cart.sync();
// })();
