const express = require("express");
const Pemesanan = require("../model/pemesananModel");
const PemesananDetail = require("../model/pemesananDetailModel");
const BestSeller = require("../model/bestSellerModel");
const { verifyToken } = require("../middleware/verifyToken");
const { Op, Sequelize, literal, DATE, where } = require("sequelize");
const jsend = require("jsend");
const User = require("../model/userModel");
const Menu = require("../model/menuModel");
const orderDetail = require("../model/orderDetailModel");
const { format } = require("mysql");
const { parse } = require("dotenv");
const { parseISO, differenceInDays } = require("date-fns");

const router = express.Router();

router.get("/all-order-menu", verifyToken, async (req, res) => {
  const { sortBy } = req.query;
  const { sortType } = req.query;
  const { search, field, limit, page, ...searchValue } = req.query;

  const whereConditions = {};
  const whereConditionsNama = {};

  for (const key in searchValue) {
    if (searchValue.hasOwnProperty(key)) {
      const value = searchValue[key];

      if (key === "user-name") {
        whereConditionsNama["nama"] = { [Op.like]: `%${value}%` };
      } else if (key === "delivery-address") {
        whereConditions["alamat_antar"] = { [Op.like]: `%${value}%` };
      } else if (key === "total-pay") {
        whereConditions["total_bayar"] = { [Op.like]: `%${value}%` };
      } else if (key === "order-time") {
        whereConditions["waktu_pemesanan"] = {
          [Op.like]: `%${value !== "all" ? value : ""}%`,
        };
      } else if (key === "status") {
        whereConditions["status"] = {
          [Op.like]: `%${value !== "all" ? value : ""}%`,
        };
      } else if (key === "order-date") {
        whereConditions["createdAt"] = {
          [Op.gte]: new Date(`${value}T00:00:00.000Z`),
          [Op.lt]: new Date(`${value}T23:59:59.999Z`),
        };
      }
    }
  }

  const offset = (page - 1) * limit;

  try {
    const orderData = await Pemesanan.findAll({
      attributes: [
        "id",
        "waktu_pemesanan",
        "alamat_antar",
        "total_bayar",
        "status",
        "createdAt",
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order:
        sortBy && sortBy != "nama" && sortType != ""
          ? [[Sequelize.literal(`${sortBy} ${sortType || ""}`)]]
          : "",
      where: whereConditions,
      include: [
        {
          model: User,
          // order:
          //   sortBy == "nama"
          //     ? [[Sequelize.literal(`${sortBy} ${sortType || ""}`)]]
          //     : "",
          attributes: ["nama"],
          where: whereConditionsNama,
          order: sortBy == "nama" ? [["nama", sortType]] : [],
        },
        {
          model: orderDetail,
          attributes: ["quantity", "catatan", "subTotal"],
          include: {
            model: Menu,
            attributes: ["nama", "kategori", "gambar"],
          },
        },
      ],
    });

    const totalItems = await Pemesanan.count({
      where: whereConditions,
      include: [
        {
          model: User,
          attributes: ["nama"],
          where: whereConditionsNama,
        },
      ],
      // where: { kategori },
    });

    if (orderData) {
      const newOrderData = orderData.map((item) => ({
        id: item.id,
        alamat_antar: item.alamat_antar,
        createdAt: item.createdAt,
        status: item.status,
        tb_order_details: item.tb_order_details,
        nama: item.tb_user.nama,
        total_bayar: item.total_bayar,
        waktu_pemesanan: item.waktu_pemesanan,
      }));

      res.status(200).json(
        jsend.success({
          orderData,
          totalItems,
          newOrderData,
          // hasMore: Math.ceil(totalItems / 6) >= page ? true : false,
        })
      );
    }
  } catch (error) {
    console.error(error);
  }
});

router.patch("/order-menu", verifyToken, async (req, res) => {
  const { id } = req.query;
  const { status } = req.body;

  try {
    const updateStatus = await Pemesanan.update(
      {
        status: status,
      },
      {
        where: {
          id: id,
        },
      }
    );

    console.log("====================================");
    console.log(updateStatus);
    console.log("====================================");

    if (updateStatus == 1) {
      res.status(200).json(
        jsend.success({
          message: "successfully updated order menu",
        })
      );
    } else {
      res.json(
        jsend.fail({
          message: "failed update order menu",
        })
      );
    }
  } catch (error) {
    console.error(error);
  }
});

router.get("/order-menu", verifyToken, async (req, res) => {
  const { createdAt } = req.query;
  const { daily } = req.query.createdAt || "";
  const { mounthly } = req.query.createdAt || "";
  const { year } = req.query.createdAt || "";
  const { startDate, lastDate } = req.query.createdAt || "";

  const daysDifference =
    startDate && lastDate
      ? differenceInDays(parseISO(lastDate), parseISO(startDate))
      : null;
  // const data =
  //   daily !== undefined ? daily : mounthly !== undefined ? mounthly : year;

  try {
    let whereCondition = {};

    if (daily !== undefined) {
      whereCondition = {
        createdAt: literal(`DATE_FORMAT(createdAt, '%Y-%m-%d') = '${daily}'`),
      };
    } else if (mounthly !== undefined) {
      whereCondition = {
        createdAt: literal(`DATE_FORMAT(createdAt, '%Y-%m') = '${mounthly}'`),
      };
    } else if (year !== undefined) {
      whereCondition = {
        createdAt: literal(`DATE_FORMAT(createdAt, '%Y') = '${year}'`),
      };
    } else if (startDate !== undefined && lastDate !== undefined) {
      if (daysDifference <= 365) {
        whereCondition = {
          // createdAt: literal(`DATE_FORMAT(createdAt, '%Y-%m-%d')`),
          createdAt: { [Op.between]: [startDate, lastDate] },
        };
      } else {
        res.json(
          jsend.fail({
            message: "Time range exceeds one year.",
          })
        );
      }

      // whereCondition.createdAt[Op.between] = [startDate, lastDate];
    }

    const orderData = await Pemesanan.findAll({
      where: whereCondition,
    });

    if (orderData) {
      res.status(200).json(
        jsend.success({
          orderData,
        })
      );
    }
  } catch (error) {
    console.error(error);
  }
});

router.get("/pemesanan", verifyToken, async (req, res) => {
  const { id } = req.user;

  try {
    const orderData = await Pemesanan.findAll({
      attributes: [
        "id",
        "waktu_pemesanan",
        "total_bayar",
        "status",
        "createdAt",
      ],
      limit: 8,
      where: {
        id_user: id,
      },
      include: [
        {
          model: orderDetail,
          attributes: ["id", "quantity", "catatan", "subTotal"],
          include: [
            {
              model: Menu,
              attributes: ["id", "nama", "harga"],
            },
          ],
        },
      ],
    });

    if (orderData) {
      res.status(200).json(
        jsend.success({
          orderData,
        })
      );
    }
  } catch (error) {
    console.error(error);
  }
});

router.post("/pemesanan", verifyToken, async (req, res) => {
  const { waktuPesanan, alamatAntar, totalBayar, dataMenu } = req.body;
  const { id } = req.user;

  try {
    const createPemesanan = await Pemesanan.create({
      id_user: id,
      waktu_pemesanan: waktuPesanan,
      alamat_antar: alamatAntar,
      total_bayar: totalBayar,
    });

    if (createPemesanan) {
      // console.log("id pemesanan : ", createPemesanan.id);
      const pemesananDetails = [];
      const bestSellerUpdates = [];

      // foreach
      dataMenu.map(async (item) => {
        const pemesananDetail = await orderDetail.create({
          id_pemesanan: createPemesanan.id,
          id_menu: item.idMenu,
          quantity: item.quantity,
          catatan: item.catatanTambahan,
        });
        pemesananDetails.push(pemesananDetail);

        const checkBestSellerData = await BestSeller.findOne({
          where: { id_menu: item.idMenu },
        });

        if (checkBestSellerData == null) {
          const bestSeller = await BestSeller.create({
            id_menu: item.idMenu,
            quantity: item.quantity,
          });

          bestSellerUpdates.push(bestSeller);
        }

        if (checkBestSellerData != null) {
          const newQuantity = checkBestSellerData.quantity + item.quantity;
          const bestSellerUpdate = checkBestSellerData.update(
            {
              quantity: newQuantity,
            },
            {
              where: { id_menu: item.idMenu },
            }
          );
          bestSellerUpdates.push(bestSellerUpdate);
        }
      });

      // db transaksi

      res.status(200).json(
        jsend.success({
          message: "CheckOut Berhasil",
        })
      );
    }
    // console.log("Pemesanan auto-generated ID:", jane.id);
    // console.log(jane);
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
