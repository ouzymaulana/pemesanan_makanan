const express = require("express");
const jsend = require("jsend");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

function verifyToken(req, res, next) {
  const bearerToken = req.headers.authorization;
  const token = bearerToken ? bearerToken.split("Bearer ")[1] : undefined;

  if (!token) {
    return res.status(401).json(
      jsend.fail({
        message: "Token not provided",
      })
    );
  }

  try {
    const result = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!result) {
      return res.status(403).json(
        jsend.fail({
          message: "Invalid token",
        })
      );
    }
    req.user = result;
    next();
  } catch (error) {
    return res.status(403).json(
      jsend.fail({
        message: "Invalid token",
      })
    );
  }
}

module.exports = {
  verifyToken,
};
