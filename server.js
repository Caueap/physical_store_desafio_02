const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const logger = require('./logger');

dotenv.config({ path: './config.env' });

const app = express();
const port = process.env.PORT || 3000;

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => logger.info("connected to DB"))
  .catch((err) => {
    logger.error("Connection to DB failed", err);
    process.exit(1);
  });

app.use(express.json());

app.listen(port, () => {
  logger.info(`API rodando na porta ${port}`);
});
