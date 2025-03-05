const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const logger = require("./utils/logger");
const storeRouter = require("./stores/routes/store-router");
const AppError = require("./utils/app-error");
const globalErrorHandler = require('./utils/global-error-handler');

dotenv.config({ path: "./config.env" });

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

app.use("/api/v1/stores", storeRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

app.listen(port, () => {
  logger.info(`API rodando na porta ${port}`);
});
