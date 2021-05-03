var express = require("express");
const { config } = require("../config");
var inventoryRouter = express.Router();
var sql = require("mssql");
var bodyParser = require("body-parser");
inventoryRouter.use(
  bodyParser.json({
    extended: true,
  })
);

inventoryRouter.route("/").get(function (req, res) {
  return res.json({ message: "Welcome To Inventory Micro Service 1.0.2" });
});

inventoryRouter.route("/login").post(function (req, res) {
  var { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({
      error: "Validation Error.",
      message: "Can't login because no username or password provided",
    });
  var queryStr = `SELECT * FROM [dbo].[fn_login] ('${username}', '${password}')`;
  new sql.ConnectionPool(config)
    .connect()
    .then((pool) => {
      return pool.request().query(queryStr);
    })
    .then((result) => {
      let rows = result.recordset;
      res.setHeader("Access-Control-Allow-Origin", "*");
      if (rows.length === 0)
        return res.status(400).json({
          error: "Invalid Error.",
          message: "User or Password incorrect",
        });
      res.status(200).json(rows);
      sql.close();
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message,
      });
      sql.close();
    });
});

inventoryRouter.route("/wh-manager").post(function (req, res) {
  var { userId } = req.body;
  if (!userId)
    return res.status(400).json({
      error: "Validation Error.",
      message: "Can't search because no userId provided",
    });
  var queryStr = `SELECT * FROM [dbo].[fn_whmanager] ('${userId}')`;
  new sql.ConnectionPool(config)
    .connect()
    .then((pool) => {
      return pool.request().query(queryStr);
    })
    .then((result) => {
      let rows = result.recordset;
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.status(200).json(rows);
      sql.close();
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message,
      });
      sql.close();
    });
});

module.exports = inventoryRouter;
