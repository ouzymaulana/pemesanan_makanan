const db = require("./connection");
const UserRoutes = require("./router/UserRoutes");
const MenuRoutes = require("./router/MenuRoutes");
const FavoriteRoutes = require("./router/FavoriteRoutes");
const express = require("express");
const cors = require("cors");
const Pemesanan = require("./router/PemesananRoutes");
const BestSellers = require("./router/BestSellers");
const PemesananDetail = require("./model/pemesananDetailModel");
const orderDetail = require("./model/orderDetailModel");
const app = express();
const port = 5000;

(async () => {
  try {
    await db.authenticate();
    console.log("Database connected");
    await orderDetail.sync();
  } catch (error) {
    console.log(error);
  }
})();
app.use(express.json());

app.use(express.static("public"));

app.use(
  cors({
    origin: "*",
  })
);
app.use(UserRoutes);
app.use("/api", FavoriteRoutes);
app.use("/api", MenuRoutes);
app.use("/api", Pemesanan);
app.use("/api", BestSellers);
// app.route(UserRoutes);

// app.post("/users", (req, res) => {
//   const { email, password } = req.body;

//   User.findOne({ where: { email, password } })
//     .then((user) => {
//       if (!user) {
//         return res
//           .status(404)
//           .json({ message: "Email atau password tidak valid" });
//       }

//       const token = jwt.sign({ email }, "secretKey");
//       res.json({ token });
//       console.log("masuk");
//     })
//     .catch((err) => {
//       console.error(err);
//       res.status(500).json({ message: "Internal server error" });
//     });
// });
// try {
//   await db.authenticate();
//   console.log("database connected");
//   await User.sync();
// } catch (error) {
//   console.log(error);
// }

// app.use(express.json());
// app.use(UserRoutes);

// app.get("/", (req, res) => {
//   db.query("SELECT * FROM tb_users", (error, result) => {
//     if (error) throw error;
//     response(200, result, "get all data users", res);
//   });
// });

// // get user by id
// app.get("/users", (req, res) => {
//   const sql = `SELECT * FROM tb_users WHERE id = ${req.query.id}`;
//   db.query(sql, (error, result) => {
//     if (error) throw error;
//     response(200, result, "find user by id", res);
//   });
// });

// // penambahan user
// app.post("/user", (req, res) => {
//   const { nama, email, divisi, saldo, password, role } = req.body;
//   const sql = `INSERT INTO tb_users (nama, email, divisi, saldo, password, role) VALUES ('${nama}', '${email}', '${divisi}', ${saldo}, '${password}', '${role}')`;

//   db.query(sql, (error, result) => {
//     if (error) response(500, "Ïnvalid", "Error", res);
//     if (result?.affectedRows) {
//       const data = {
//         isSuccess: result.affectedRows,
//         id: result.insertId,
//       };
//       response(200, data, "User added successfully", res);
//     }
//   });
// });

// // update data by id
// app.put("/user", (req, res) => {
//   const { id, nama, email, divisi, saldo, password, role } = req.body;
//   const sql = `UPDATE tb_users SET nama = '${nama}', email = '${email}', divisi = '${divisi}', saldo = ${saldo}, password = '${password}', role = '${role}' WHERE id = ${id}`;

//   db.query(sql, (error, result) => {
//     if (error) response(500, "invalid", "error", res);
//     if (result?.affectedRows) {
//       const data = {
//         isSuccess: result.affectedRows,
//       };
//       response(200, data, "User updated successfully", res);
//     } else {
//       response(404, "user not found", "Error", res);
//     }
//   });
// });

// // delete user data by id
// app.delete("/user", (req, res) => {
//   const sql = `DELETE FROM tb_user WHERE id = ${req.body.id}`;
//   db.query(sql, (error, result) => {
//     if (error) response(500, "invalid", "error", res);
//     if (result?.affectedRows) {
//       const data = {
//         isSuccess: result.affectedRows,
//         id: result.insertId,
//       };
//       response(200, data, "User deleted", res);
//     } else {
//       response(404, "user not found", "Error", res);
//     }
//   });
// });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
