const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const User = require("./../model/userModel");
const bcrypt = require("bcrypt");
const jsend = require("jsend");
const router = express.Router();
const { verifyToken } = require("../middleware/verifyToken");
const { Op, Sequelize, literal, DATE } = require("sequelize");
const nodemailer = require("nodemailer");
require("dotenv").config();

router.post("/admin/user/create", verifyToken, async (req, res) => {
  const { nama, email, divisi, role } = req.body;

  const secretKey = process.env.VERIFY_TOKEN_SECRET;

  const verificationToken = jwt.sign({ email }, secretKey, { expiresIn: "1h" });

  const verificationUrl = `http://localhost:3000/verification?token=${verificationToken}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "gunnarrr08@gmail.com",
      pass: "qyuesnwhtreloggm",
      // pass: "gunnar1234",
    },
  });

  const mailOptions = {
    from: "gunnarrr08@gmail.com",
    to: email,
    // to: "ouzymaulana@gmail.com",
    subject: "Verify Your Email",
    text: "Hello world?",
    html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to send verification email" });
    } else {
      console.log("Email sent:", info.response);
      res.json({ message: "Verification email sent successfully" });
    }
  });

  const createUser = await User.create({
    nama: nama,
    email: email,
    divisi: divisi,
    role: role,
  });

  if (createUser) {
    res.status(200).json(
      jsend.success({
        message: "successfully added new user",
      })
    );
  }
});

router.get("/users", verifyToken, (req, res) => {
  try {
    const users = User.findAll();
    res.json(users);
  } catch (error) {
    console.error(error);
  }
});

router.get("/user", verifyToken, async (req, res) => {
  const { email } = req.user;
  try {
    const user = await User.findOne({ where: { email } });
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

      console.log(password);
      console.log(user.password);

      bcrypt.compare(password, user.password).then(function (result) {
        if (result) {
          const token = jwt.sign(
            {
              email: email,
              saldo: user.saldo,
              id: user.id,
              nama: user.nama,
              role: user.role,
            },
            process.env.ACCESS_TOKEN_SECRET
          );
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

      // });
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

router.patch("/users/verify", async (req, res) => {
  const { confirmPassword, password } = req.body;
  const tokenVerify = req.headers.token;

  const tokenVerifySecret = process.env.VERIFY_TOKEN_SECRET;
  console.log("TOKEN : ", tokenVerify);
  try {
    const tokenValue = jwt.verify(tokenVerify, tokenVerifySecret);
    if (tokenValue) {
      const email = tokenValue.email;
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(400).json(
          jsend.fail({
            message: "Email tidak ditemukan",
          })
        );
      }

      if (password !== confirmPassword) {
        return res.status(400).json(
          jsend.fail({
            message: "password dan confirm password tidak sama",
          })
        );
      }

      bcrypt.hash(password, 10, function (err, hash) {
        if (err) {
          return res.status(500).json(
            jsend.error({
              message: "Internal server error",
            })
          );
        }
        if (hash) {
          user.update(
            {
              password: hash,
              isVerified: 1,
            },
            {
              where: { email: email },
            }
          );
          res.json(
            jsend.success({
              message: "berhasil verifikasi",
            })
          );
        }
      });
    }
  } catch (error) {
    console.error(error.message);
    console.error(error.name);
    // if (error.name === "TokenExpiredError") {
    res.status(500).json({ message: "Terjadi kesalahan saat verifikasi." });
    // }
  }

  // try {
  //   const user = await User.findOne({ where: { email } });

  //   if (!user) {
  //     return res.status(400).json(
  //       jsend.fail({
  //         message: "Email tidak ditemukan",
  //       })
  //     );
  //   }

  //   if (password !== confirmPassword) {
  //     return res.status(400).json(
  //       jsend.fail({
  //         message: "password dan confirm password tidak sama",
  //       })
  //     );
  //   }

  //   bcrypt.hash(password, 10, function (err, hash) {
  //     if (err) {
  //       return res.status(500).json(
  //         jsend.error({
  //           message: "Internal server error",
  //         })
  //       );
  //     }
  //     if (hash) {
  //       user.update(
  //         {
  //           password: hash,
  //         },
  //         {
  //           where: { email: email },
  //         }
  //       );
  //       res.json(
  //         jsend.success({
  //           message: "berhasil verifikasi",
  //         })
  //       );
  //     }
  //   });
  // } catch (error) {
  //   console.error(error);
  //   res.status(500).json(
  //     jsend.error({
  //       message: "Internal server error",
  //     })
  //   );
  // }
});

// router.patch("/user/change-password", verifyToken, async (req, res) => {
router.patch("/user/change-password", async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  // const { id } = req.user;
  const id = 1;

  const user = await User.findOne({ where: { id } });

  if (!user) {
    return res.status(404).json(
      jsend.fail({
        message: "user tidak ditemukan",
      })
    );
  }

  // const contoh = await bcrypt.hash(oldPassword, 10);
  bcrypt.compare(oldPassword, user.password).then(function (result) {
    if (result) {
      console.log("true : ", result);
      if (newPassword !== confirmPassword) {
        return res.status(400).json(
          jsend.fail({
            message: "password dan confirm password tidak sama",
          })
        );
      }
      bcrypt.hash(newPassword, 10, function (err, hash) {
        if (err) {
          return res.status(500).json(
            jsend.error({
              message: "Internal server error",
            })
          );
        }
        if (hash) {
          user.update(
            {
              password: hash,
            },
            {
              where: { id: id },
            }
          );
          res.json(
            jsend.success({
              message: "password updated",
            })
          );
        }
      });
    } else {
      res.json(
        jsend.fail({
          message: "Old Password tidak valid",
        })
      );
    }
  });
});

router.post("/user/topUpBalance", verifyToken, async (req, res) => {
  const { topupAmount } = req.body;
  const { email } = req.user;

  try {
    const user = await User.findOne({ where: { email } });
    if (user) {
      const newBalance = parseInt(user.saldo) + parseInt(topupAmount);
      user.update({
        saldo: newBalance,
      });

      res.json(
        jsend.success({
          newBalance: newBalance,
          user: user,
          message: "Balance Updated",
        })
      );
    } else {
      res.json(
        jsend.fail({
          message: "User Undefined",
        })
      );
    }
  } catch (error) {
    console.error(error);
  }
});

router.post("/user/transferBalance", verifyToken, async (req, res) => {
  const { destinationEmail, transferAmount } = req.body;
  const { email } = req.user;

  try {
    const userDestination = await User.findOne({
      where: { email: destinationEmail },
    });
    const userTransfer = await User.findOne({
      where: { email },
    });

    if (userDestination && userTransfer) {
      const newBalance =
        parseInt(userDestination.saldo) + parseInt(transferAmount);
      userDestination.update({
        saldo: newBalance,
      });

      userTransfer.update({
        saldo: parseInt(userTransfer.saldo) - parseInt(transferAmount),
      });

      res.json(
        jsend.success({
          message: "Balance Updated",
        })
      );
    } else {
      res.json(
        jsend.fail({
          message: "User Undefined",
        })
      );
    }
  } catch (error) {
    console.error(error);
  }
});

router.post("/admin/user/cashWithDrawwal", verifyToken, async (req, res) => {
  const { email } = req.user;
  const { password } = req.body;
  const { withdrawalAmount } = req.body;

  try {
    const getUser = await User.findOne({
      where: { email: email },
    });

    bcrypt.compare(password, getUser.password).then(function (result) {
      if (result) {
        if (getUser.saldo > withdrawalAmount) {
          const newBalance = getUser.saldo - withdrawalAmount;
          const updateBalance = getUser.update({
            saldo: newBalance,
          });

          if (updateBalance) {
            res.json(
              jsend.success({
                message: "Success",
              })
            );
          }
        } else {
          console.log("MASUKKK");
          res.json(
            jsend.fail({
              message: "saldo tidak cukup",
            })
          );
        }
      } else {
        console.log("resul ngga ada");
        res.json(
          jsend.fail({
            message: "Invalid Password",
          })
        );
      }
    });
  } catch (error) {
    console.error(error);
  }
});

router.get("/admin/user", verifyToken, async (req, res) => {
  const { sortBy } = req.query;
  const { sortType } = req.query;
  const { limit, page, ...searchValue } = req.query;

  const whereConditions = {};

  for (const key in searchValue) {
    if (searchValue.hasOwnProperty(key)) {
      const value = searchValue[key];

      if (key === "name") {
        whereConditions["nama"] = { [Op.like]: `%${value}%` };
      } else if (key === "email") {
        whereConditions["email"] = { [Op.like]: `%${value}%` };
      } else if (key === "division") {
        whereConditions["divisi"] = { [Op.like]: `%${value}%` };
      } else if (key === "role") {
        whereConditions["role"] = { [Op.like]: `%${value}%` };
      } else if (key === "registerDate") {
        whereConditions["createdAt"] = {
          [Op.gte]: new Date(`${value}T00:00:00.000Z`),
          [Op.lt]: new Date(`${value}T23:59:59.999Z`),
        };
      }
    }
  }

  const offset = (page - 1) * limit;

  try {
    const DataUser = await User.findAll({
      attributes: [
        "id",
        "nama",
        "email",
        "divisi",
        "role",
        "isVerified",
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

    const totalItems = await User.count();
    if (DataUser) {
      res.status(200).json(
        jsend.success({
          DataUser,
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

router.put("/admin/user/update", verifyToken, async (req, res) => {
  const { nama, email, divisi, role } = req.body;
  const { id } = req.query;

  try {
    const updateUser = await User.update(
      {
        nama: nama,
        email: email,
        divisi: divisi,
        role: role,
      },
      {
        where: {
          id: id,
        },
      }
    );

    if (updateUser) {
      res.status(200).json(
        jsend.success({
          message: "successfully updated a user",
        })
      );
    } else {
      res.json(
        jsend.fail({
          message: "failed updated the user",
        })
      );
    }
  } catch (error) {}
});

router.delete("/admin/user/delete", verifyToken, async (req, res) => {
  const { id } = req.body;
  try {
    const deleteUser = await User.destroy({
      where: {
        id: id,
      },
    });

    if (deleteUser === 1) {
      res.status(200).json(
        jsend.success({
          message: "successfully deleted a user",
        })
      );
    } else {
      res.json(
        jsend.fail({
          message: "failed delete the user",
        })
      );
    }
  } catch (error) {
    console.error(error);
  }
});
module.exports = router;
