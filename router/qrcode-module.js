var express = require("express");
var qrCodeRouter = express.Router();
var sql = require("mssql");
var bodyParser = require("body-parser");
const moment = require("moment");
const e = require("express");
const { ErrorResponse, successResponse } = require("../helpers/apiResponse");
qrCodeRouter.use(
  bodyParser.json({
    extended: true,
  })
);
const config = {
  user: "itech",
  password: "P@ssw0rd",
  server: "1.179.203.226",
  database: "NTN_DB",
  port: 1444,
  pool: {
    max: 0,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: false,
  },
};

function sleep(delay = 0) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}

async function insertData(res, params) {
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
  } = params;

  await new sql.ConnectionPool(config)
    .connect()
    .then(async (pool) => {
      return await Promise.resolve(
        pool
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
          .execute("fn_insert_tag")
      );
    })
    .then(async (result) => {
      let rows = result.recordset;
      await sql.close();
      return await Promise.resolve(rows);
    })
    .catch(async (err) => {
      await ErrorResponse(res, err.message);
      await sql.close();
    });
}

qrCodeRouter.route("/").get(function (req, res) {
  return res.json({ message: "Welcome To Inventory Micro Service 1.0.1" });
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
      ErrorResponse(res, err.message);
      sql.close();
    });
});

qrCodeRouter
  .route("/insert_tag_no_select_data")
  .post(async function (req, res) {
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
      qrcode,
    } = req.body;
    if (Tag_Type === "pallet") {
      console.log("pallet");
      ms_id = null;
      quantity = null;
      p_unit = null;
      doc_no = null;
      rec_date = null;
      Updated_By = null;
      lot_no = null;
    } else {
      console.log("not pallet");
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
      if (!qrcode)
        return res.status(400).json({
          error: "Validation Error.",
          message: "Can't search because no qrcode provided",
        });
    }
    gen_group = moment().format("YYYYMMDDHHmmss");
    const data = {
      gen_group,
      ms_id,
      quantity,
      p_unit,
      remark,
      doc_no,
      rec_date,
      Tag_Type,
      Updated_By,
      lot_no,
      qrcode,
    };
    const listItems = [];
    for (let index = 0; index < qrcode; index++) {
      listItems.push(gen_group);
    }
    const promises = listItems.map(async () => {
      return insertData(res, data);
    });
    await Promise.all(promises);
    successResponse(res, gen_group);
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
      successResponse(res, rows);
      sql.close();
    })
    .catch((err) => {
      ErrorResponse(res, err.message);
      sql.close();
    });
});

qrCodeRouter.route("/insert_tag").post(async function (req, res) {
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
    qrcode,
  } = req.body;
  if (Tag_Type === "pallet") {
    ms_id = null;
    quantity = null;
    p_unit = null;
    doc_no = null;
    rec_date = null;
    Updated_By = null;
    lot_no = null;
  } else {
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
    if (!qrcode)
      return res.status(400).json({
        error: "Validation Error.",
        message: "Can't search because no qrcode provided",
      });
  }
  gen_group = moment().format("YYYYMMDDHHmmss");
  const data = {
    gen_group,
    ms_id,
    quantity,
    p_unit,
    remark,
    doc_no,
    rec_date,
    Tag_Type,
    Updated_By,
    lot_no,
    qrcode,
  };
  const listItems = [];
  for (let index = 0; index < qrcode; index++) {
    listItems.push(gen_group);
  }
  const promises = listItems.map(async () => {
    return insertData(res, data);
  });
  await Promise.all(promises, Promise.resolve());
  await sleep(3000);

  var queryStr = `SELECT * from fn_select_barcode ('${gen_group}') ORDER BY Tagpds_Id`;
  new sql.ConnectionPool(config)
    .connect()
    .then((pool) => {
      return pool.request().query(queryStr);
    })
    .then((result) => {
      let rows = result.recordset;
      res.setHeader("Access-Control-Allow-Origin", "*");
      successResponse(res, rows);
      sql.close();
    })
    .catch((err) => {
      ErrorResponse(res, err.message);
      sql.close();
    });
});

module.exports = qrCodeRouter;
