// import { DataTypes, Sequelize } from "sequelize";
// import db from "../connection";
const { DataTypes, Sequelize } = require("sequelize");
const db = require("./../connection");

const dataType = Sequelize;

const Favorite = db.define(
  "tb_favorite_menu",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_user: { type: DataTypes.INTEGER },
    id_menu: { type: DataTypes.INTEGER },
  },
  {
    freezeTableName: true,
  }
);

// export default User;
module.exports = Favorite;
(async () => {
  await Favorite.sync();
})();
