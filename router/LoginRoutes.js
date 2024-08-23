const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const User = require("./../model/userModel");
const bcrypt = require("bcrypt");
const jsend = require("jsend");
const router = express.Router();
require("dotenv").config();

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  User.findOne({ where: { email } })
    .then((user) => {
      if (!user) {
        return res.status(404).json(
          jsend.fail({
            message: "Email Tidak Valid",
          })
        );
      }

      bcrypt.compare(password, user.password).then(function (result) {
        if (result) {
          const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET);
          res.json(
            jsend.success({
              message: "login berhasil",
              token: token,
            })
          );
        } else {
          res.json(
            jsend.fail({
              message: "Password tidak valid",
            })
          );
        }
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json(
        jsend.error({
          message: "Internal server error",
        })
      );
    });
});

module.exports = router;
