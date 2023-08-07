const express = require("express");
const Menu = require("../model/menuModel");
const { verifyToken } = require("../middleware/verifyToken");
const jsend = require("jsend");
const { Op, Sequelize, literal, DATE } = require("sequelize");
const { route } = require("./PemesananRoutes");
const { id } = require("date-fns/locale");
const multer = require("multer");
const { join } = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

const router = express.Router();

router.patch(
  "/admin/menu/update",
  verifyToken,
  upload.single("gambar"),
  async (req, res) => {
    // const { filename } = req.file;
    // const { nama, kategori, harga, nama_tempat, alamat } = req.body.otherData;
    const otherData = JSON.parse(req.body.otherData);
    const { id } = req.query;
    const newFilename = req.file?.filename || undefined;

    try {
      const oldData = await Menu.findByPk(id);
      const oldImage = oldData.gambar;

      const updateData = {
        nama: otherData.nama,
        kategori: otherData.kategori,
        harga: otherData.harga,
        nama_tempat: otherData.nama_tempat,
        alamat: otherData.alamat,
      };

      if (newFilename !== undefined) {
        updateData.gambar = newFilename;
      }

      const updateMenu = await Menu.update(updateData, {
        where: {
          id: id,
        },
      });

      if (updateMenu) {
        if (oldImage && newFilename && oldImage !== newFilename) {
          fs.unlinkSync(`public/images/${oldImage}`);
        }

        res.status(200).json(
          jsend.success({
            message: "successfully updated a menu",
          })
        );
      } else {
        res.json(
          jsend.fail({
            message: "failed updated the menu",
          })
        );
      }
    } catch (error) {
      console.error(error);
    }
  }
);

router.get("/menu", verifyToken, async (req, res) => {
  const { page, limit, kategori, nama } = req.query;

  const search = nama === undefined ? "" : nama;
  const kategoriData = kategori === undefined ? "" : kategori;

  const offset = (page - 1) * limit;

  try {
    let whereCondition = { nama: { [Op.like]: `%${search}%` } };

    if (kategoriData !== "") {
      whereCondition.kategori = kategoriData;
    }

    const menu = await Menu.findAll({
      where: whereCondition,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const totalItems = await Menu.count({
      where: whereCondition,
      // where: { kategori },
    });

    res.json({
      data: menu,
      totalItems,
      // totalPages: Math.ceil(totalItems / limit),
      // hasMore: totalItems >= limit ? true : false,
      hasMore: Math.ceil(totalItems / limit) >= page ? true : false,
    });
    // console.log("====================================");
    // console.log("total item : ", totalItems);
    // console.log("menu length : ", menu.length);
    // console.log("menu : ", menu);
    // console.log("page : ", page);
    // console.log("limit : ", limit);
    // console.log("hasmore : ", totalItems >= limit ? true : false);
    // console.log("totalPages:", Math.ceil(totalItems / limit));
    // console.log("offset : ", offset);
    // console.log("====================================");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/menus", verifyToken, async (req, res) => {
  const { id } = req.query;

  try {
    const user = await Menu.findOne({ where: { id } });

    if (user) {
      res.json(
        jsend.success({
          user,
        })
      );
    }
  } catch (error) {
    console.error(error);
  }
});

router.get("/getMenuByidMenu", verifyToken, async (req, res) => {
  try {
    if (req.query.data && Array.isArray(req.query.data)) {
      const idMenus = req.query.data.map((item) => item.idMenu);

      const menu = await Menu.findAll({
        where: { id: idMenus },
      });

      if (menu) {
        res.json(
          jsend.success({
            menu: menu,
          })
        );
      }
    } else {
      res.status(400).json({ error: "Invalid request data" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/menu", verifyToken, async (req, res) => {
  const { sortBy } = req.query;
  const { sortType } = req.query;
  const { limit, page, ...searchValue } = req.query;

  const whereConditions = {};
  const whereConditionsNama = {};

  for (const key in searchValue) {
    if (searchValue.hasOwnProperty(key)) {
      const value = searchValue[key];

      if (key === "name") {
        whereConditions["nama"] = { [Op.like]: `%${value}%` };
      } else if (key === "category") {
        whereConditions["kategori"] = { [Op.like]: `%${value}%` };
      } else if (key === "price") {
        whereConditions["harga"] = { [Op.like]: `%${value}%` };
      } else if (key === "restaurant-name") {
        whereConditions["nama_tempat"] = { [Op.like]: `%${value}%` };
      } else if (key === "address") {
        whereConditions["alamat"] = { [Op.like]: `%${value}%` };
      } else if (key === "registered-date") {
        whereConditions["createdAt"] = {
          [Op.gte]: new Date(`${value}T00:00:00.000Z`),
          [Op.lt]: new Date(`${value}T23:59:59.999Z`),
        };
      }
    }
  }

  const offset = (page - 1) * limit;

  try {
    const DataMenu = await Menu.findAll({
      attributes: [
        "id",
        "nama",
        "kategori",
        "harga",
        "nama_tempat",
        "alamat",
        "gambar",
        "createdAt",
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order:
        sortBy && sortType != ""
          ? [[Sequelize.literal(`${sortBy} ${sortType || ""}`)]]
          : "",
      where: whereConditions,
    });

    const totalItems = await Menu.count();

    console.log("====================================");
    console.log(DataMenu);
    console.log("====================================");
    if (DataMenu) {
      res.status(200).json(
        jsend.success({
          DataMenu,
          totalItems,
          sortBy,
          sortType,
        })
      );
    }
  } catch (error) {
    console.error(error);
  }
});

router.post(
  "/admin/menu/create",
  verifyToken,
  upload.single("gambar"),
  async (req, res) => {
    const { filename } = req.file;
    const { nama, kategori, harga, nama_tempat, alamat } = req.body;

    try {
      const createMenu = await Menu.create({
        nama: nama,
        kategori: kategori,
        harga: harga,
        nama_tempat: nama_tempat,
        alamat: alamat,
        gambar: filename,
      });

      if (createMenu) {
        res.status(200).json(
          jsend.success({
            message: "successfully added new menu",
          })
        );
      }
    } catch (error) {
      console.error(error);
    }
  }
);

router.delete("/admin/menu/delete", verifyToken, async (req, res) => {
  const { id } = req.body;
  try {
    const deleteMenu = await Menu.destroy({
      where: {
        id: id,
      },
    });

    if (deleteMenu === 1) {
      res.status(200).json(
        jsend.success({
          message: "successfully deleted a menu",
        })
      );
    } else {
      res.json(
        jsend.fail({
          message: "failed delete the menu",
        })
      );
    }
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
