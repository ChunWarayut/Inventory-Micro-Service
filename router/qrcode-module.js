var express = require("express");
var qrCodeRouter = express.Router();
var sql = require("mssql");
var bodyParser = require("body-parser");
const moment = require("moment");
qrCodeRouter.use(
  bodyParser.json({
    extended: true,
  })
);
const config = {
  user: "itech",
  password: "P@ssw0rd",
  server: "sme.fortiddns.com",
  database: "NTN_DB",
  port: 14330,
  pool: {
    max: 0,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: false,
  },
};

qrCodeRouter.route("/").get(function (req, res) {
  return res.json({ message: "Welcome To Inventory Micro Service 1.0.0" });
});

qrCodeRouter.route("/master-barcode").post(function (req, res) {
  var { master_barcode } = req.body;
  if (!master_barcode)
    return res.status(400).json({
      error: "Validation Error.",
      message: "Can't search because no master_barcode provided",
    });
  var queryStr = `SELECT * FROM [dbo].[fn_master_barcode] ('${master_barcode}')`;
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

qrCodeRouter.route("/insert_tag").post(function (req, res) {
  var {
    ms_id,
    quantity,
    p_unit,
    remark,
    doc_no,
    rec_date,
    Tag_Type,
    Updated_By,
    lot_no,
  } = req.body;
  if (!ms_id)
    return res.status(400).json({
      error: "Validation Error.",
      message: "Can't search because no ms_id provided",
    });
  if (!quantity)
    return res.status(400).json({
      error: "Validation Error.",
      message: "Can't search because no quantity provided",
    });
  if (!p_unit)
    return res.status(400).json({
      error: "Validation Error.",
      message: "Can't search because no p_unit provided",
    });
  if (!remark)
    return res.status(400).json({
      error: "Validation Error.",
      message: "Can't search because no remark provided",
    });
  if (!doc_no)
    return res.status(400).json({
      error: "Validation Error.",
      message: "Can't search because no doc_no provided",
    });
  if (!rec_date)
    return res.status(400).json({
      error: "Validation Error.",
      message: "Can't search because no rec_date provided",
    });
  if (!Tag_Type)
    return res.status(400).json({
      error: "Validation Error.",
      message: "Can't search because no Tag_Type provided",
    });
  if (!Updated_By)
    return res.status(400).json({
      error: "Validation Error.",
      message: "Can't search because no Updated_By provided",
    });
  if (!lot_no)
    return res.status(400).json({
      error: "Validation Error.",
      message: "Can't search because no lot_no provided",
    });
    gen_group = moment().format('YYYYMMDDHHmmss')
  new sql.ConnectionPool(config)
    .connect()
    .then((pool) => {
      return pool
        .request()
        .input("ms_id", sql.BigInt, ms_id)
        .input("quantity", sql.Float, quantity)
        .input("p_unit", sql.NVARCHAR(20), p_unit)
        .input("remark", sql.NVarChar(sql.MAX), remark)
        .input("doc_no", sql.NVARCHAR(50), doc_no)
        .input("rec_date", sql.Date, rec_date)
        .input("Tag_Type", sql.NVARCHAR(10), Tag_Type)
        .input("Updated_By", sql.NVARCHAR(10), Updated_By)
        .input("gen_group", sql.NVARCHAR(100), gen_group)
        .input("lot_no", sql.NVARCHAR(50), lot_no)
        .execute("fn_insert_tag");
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

qrCodeRouter.route("/select-barcode").post(function (req, res) {
  var { barcode } = req.body;
  if (!barcode)
    return res.status(400).json({
      error: "Validation Error.",
      message: "Can't search because no barcode provided",
    });
  var queryStr = `SELECT * from fn_select_barcode ('${barcode}') ORDER BY Tagpds_Id`;
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

module.exports = qrCodeRouter;
