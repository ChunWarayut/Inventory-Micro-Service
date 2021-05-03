const dotenv = require("dotenv");
dotenv.config();
module.exports = {
  config: {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    pool: {
      max: 0,
      min: 0,
      idleTimeoutMillis: 30000,
    },
    options: {
      encrypt: false,
    },
  },
  ver: process.env.VER,
};
