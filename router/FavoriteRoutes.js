const express = require("express");
const Favorite = require("../model/favoriteModel");
const User = require("./../model/userModel");
const Menu = require("./../model/menuModel");
const { verifyToken } = require("../middleware/verifyToken");
const { Op } = require("sequelize");
const jsend = require("jsend");
require("dotenv").config();

const router = express.Router();

router.post("/favorite", async (req, res) => {
  const { id_menu } = req.body.data;
  const { email } = req.body.data;

  try {
    const user = await User.findOne({ where: { email } });
    console.log(user);
    if (user) {
      const ifHasDataFavorite = await Favorite.findOne({
        where: { id_user: user.id, id_menu: id_menu },
      });
      if (ifHasDataFavorite == null) {
        console.log("====================================");
        console.log("ADA PENAMBAHAN");
        console.log("====================================");
        await Favorite.create({
          id_user: user.id,
          id_menu: id_menu,
        });

        res.json(
          jsend.success({
            message: "Create",
          })
        );
      } else {
        await Favorite.destroy({
          where: {
            id_user: user.id,
            id_menu: id_menu,
          },
        });

        res.json(
          jsend.success({
            message: "Delete",
          })
        );
      }
    } else {
      res.json(
        jsend.fail({
          message: "data user tidak ditemukan",
        })
      );
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(
      jsend.error({
        message: "Internal server error",
      })
    );
  }
});

router.get("/favorite", verifyToken, async (req, res) => {
  const { email } = req.user;

  try {
    const user = await User.findOne({ where: { email } });

    const favorite = await Favorite.findAll({
      where: {
        id_user: user.id,
      },
    });

    const menuIds = favorite.map((favorite) => favorite.id_menu);

    const menuItems = await Menu.findAll({
      where: {
        id: {
          [Op.in]: menuIds,
        },
      },
    });

    if (menuItems) {
      console.log("====================================");
      console.log("ADA YA DATANYA");
      console.log("====================================");
      res.json(
        jsend.success({
          message: "berhasil mendapatkan data favorite",
          data: menuItems,
        })
      );
    } else {
      res.json(
        jsend.fail({
          message: "Data tidak ditemukan",
        })
      );
    }
  } catch (error) {
    res.json(
      jsend.error({
        message: "internal server error",
      })
    );
  }
});

module.exports = router;
