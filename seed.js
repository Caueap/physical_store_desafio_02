const dotenv = require("dotenv");
const mongoose = require("mongoose");
const logger = require("./logger");
const Store = require("./models/store-model");

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => logger.info("Connected to DB"))
  .catch((err) => {
    logger.error("Failed connection to DB", err);
    process.exit(1);
  });

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function generateRandomAddress(index) {
  return {
    logradouro: `Rua ${index + 1}`,
    complemento: index % 2 === 0 ? `Bloco ${index}` : "",
    bairro: `Bairro ${Math.ceil(index / 5)}`,
    localidade: `Cidade ${Math.ceil(index / 10)}`,
    estado: `Estado ${String.fromCharCode(65 + (index % 5))}`,
  };
}

async function seedStores() {
  try {
    await Store.deleteMany({});
    const stores = [];

    for (let i = 0; i < 30; i++) {
      const lat = randomBetween(-7, -2);
      const lon = randomBetween(-42, -38);

      stores.push({
        name: `Loja ${i + 1}`,
        address: generateRandomAddress(i),
        location: {
          type: "Point",
          coordinates: [lon, lat],
        },
      });
    }

    await Store.insertMany(stores);
    logger.info("30 lojas inseridas com sucesso!");
    process.exit(0);
  } catch (err) {
    logger.error("Erro ao inserir lojas", err);
    process.exit(1);
  }
}

seedStores();
