var express = require("express");
var bodyParser = require("body-parser");

var inventoryRouter = require("./router/inventory-module");
var app = express();
var cors = require("cors");

const hostname = "127.0.0.1";

var port = process.env.PORT || 80;
app.use(
  bodyParser.json({
    extended: true,
  })
);
app.use(cors());
app.options("*", cors());

app.get("/", function (req, res) {
  res.json({ message: "Welcome To Inventory Micro Service 1.0.0" });
});

app.use("/api", [inventoryRouter]);

app.use(function (req, res, error) {
  res.end("Page not found");
});

app.listen(port, function () {
  console.log("Server running@ " + hostname + ":" + port);
});
