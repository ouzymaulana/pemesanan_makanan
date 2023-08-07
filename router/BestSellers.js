const express = require("express");
const BestSeller = require("../model/bestSellerModel");
const Menu = require("../model/menuModel");
const { verifyToken } = require("../middleware/verifyToken");
const { Op } = require("sequelize");
const jsend = require("jsend");

const router = express.Router();

router.get("/best-sellers", async (req, res) => {
  try {
    const menuBestSellers = await BestSeller.findAll({
      order: [["quantity", "DESC"]],
      limit: 8,
      include: [
        {
          model: Menu,
        },
      ],
    });

    if (menuBestSellers) {
      res.status(200).json(
        jsend.success({
          menuBestSellers,
          message: "Berhasil",
        })
      );
    }
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
