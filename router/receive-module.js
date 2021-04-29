var express = require("express");
var receiveRouter = express.Router();
var sql = require("mssql");
var bodyParser = require("body-parser");
const moment = require("moment");
const e = require("express");
const { ErrorResponse, successResponse } = require("../helpers/apiResponse");
receiveRouter.use(
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

function sleep(delay = 0) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}

async function scanBarcodeCheckGRGI(barcode, res) {
  var queryStr = `SELECT * FROM [dbo].[fn_barcode_checkGRGI] ('${barcode}')`;
  return new sql.ConnectionPool(config)
    .connect()
    .then((pool) => {
      return pool.request().query(queryStr);
    })
    .then((result) => {
      sql.close();
      let rows = result.recordset;
      return rows;
    })
    .catch((err) => {
      sql.close();
      ErrorResponse(res, err.message);
      return err.message;
    });
}
async function selectBarcodeItem(barcode, res) {
  var queryStr = `SELECT	ms_barcode, Tagpds_Id, Ms_Id, quantity, p_unit, doc_no, rec_date, lot_no, Tag_Type, remark, MS_CD, MS_NO, MS_NAME , MS_MAINUNIT FROM [dbo].[fn_select_barcode_item] ('${barcode}')`;
  return new sql.ConnectionPool(config)
    .connect()
    .then((pool) => {
      return pool.request().query(queryStr);
    })
    .then((result) => {
      let rows = result.recordset;
      sql.close();
      return rows;
    })
    .catch((err) => {
      sql.close();
      ErrorResponse(res, err.message);
      return err.message;
    });
}

receiveRouter.route("/scan-barcode-work").post(async function (req, res) {
  var { barcode } = req.body;
  if (!barcode)
    return res.status(400).json({
      error: "Validation Error.",
      message: "Can't search because no barcode provided",
    });
  const _scanBarcodeCheckGRGI = await scanBarcodeCheckGRGI(barcode, res);
  if (_scanBarcodeCheckGRGI.length > 0) {
    return res.status(400).json({
      error: "Validation Error.",
      message: "กรุณา..ตรวจสอบบาร์โค๊ต เนื่องจากมีการใช้งานแล้ว !!!",
    });
  }
  const _selectBarcodeItem = await selectBarcodeItem(barcode, res);
  if (_selectBarcodeItem.length === 0) {
    return res.status(400).json({
      error: "Validation Error.",
      message: "กรุณา..ตรวจสอบบาร์โค๊ต บาร์โค๊ตไม่ถูกต้อง !!!",
    });
  }
  if (_selectBarcodeItem[0].Tag_Type.toUpperCase() === 'PALLET') {
    return res.status(400).json({
      error: "Validation Error.",
      message: "กรุณา..ตรวจสอบบาร์โค๊ต บาร์โค๊ตไม่ถูกต้อง !!!",
    });
  }
  successResponse(res, _selectBarcodeItem);
});

module.exports = receiveRouter;
