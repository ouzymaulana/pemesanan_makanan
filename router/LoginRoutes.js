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

  // try {
  //   const user = await User.findOne({ where: { email } });

  //   if (!user) {
  //     return res.status(404).json(
  //       jsend.fail({
  //         message: "Email Tidak Valid",
  //       })
  //     );
  //   }

  //   console.log(password);
  //   console.log(user.password);

  //   const match = await bcrypt.compare(password, user.password);

  //   bcrypt.compare(password, user.password).then(function (result) {
  //     console.log("bisa : ", result);
  //   });

  //   console.log(match);

  //   // bcrypt.compare(password, user.password, function (err, result) {
  //   //   console.log("hasil : ", result);
  //   // });

  //   const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET);
  //   return res.json(
  //     jsend.success({
  //       message: "login berhasil",
  //       token: token,
  //     })
  //   );
  // } catch (error) {
  //   console.error(error);
  //   res.status(500).json(
  //     jsend.error({
  //       message: "Internal server error",
  //     })
  //   );
  // }
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
