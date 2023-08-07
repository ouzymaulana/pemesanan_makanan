const express = require("express");
const jsend = require("jsend");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

function verifyToken(req, res, next) {
  const bearerToken = req.headers.authorization;
  // const token = req.headers["authorization"];
  const token = bearerToken.split("Bearer ")[1];

  // console.log("token: ", token);
  // console.log("env: ", process.env.ACCESS_TOKEN_SECRET);

  // const tokenPayload = jwt.verify(token, "secretKey");
  // console.log(tokenPayload);

  if (token === undefined) {
    return res.status(401).json(
      jsend.fail({
        message: "Token not provided",
      })
    );
  }
  const result = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  if (!result) {
    return res.status(403).json(
      jsend.fail({
        message: "Invalid token",
      })
    );
  }
  req.user = result; // Menyimpan informasi pengguna dari token ke objek request
  next();
  // jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
  //   console.error(err);
  //   console.log(decoded);
  //   if (err) {
  //     return res.status(403).json(
  //       jsend.fail({
  //         message: "Invalid token",
  //       })
  //     );
  //   }

  // req.user = result; // Menyimpan informasi pengguna dari token ke objek request
  // next();
  // });
}

module.exports = {
  verifyToken,
};
