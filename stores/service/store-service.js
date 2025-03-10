const logger = require("../../utils/logger");
const Store = require("../model/store-model");
const functions = require("../../utils/functions");

exports.getStores = async (req, res) => {
  const cep = req.query.cep;

  if (!cep) {
    logger.warn("CEP não informado na requisição");
    return res.status(400).json({
      error: "CEP não informado",
    });
  }

  try {
    functions.cepValidatorForDigitsLength(cep, res);

    functions.cepValidatorForNumbersOnly(cep, res);

    const addressData = await functions.getAddressByCep(cep);

    const geocodeData = await functions.getCoordinates(addressData, cep);

    const addressLat = parseFloat(geocodeData[0].lat);
    const addressLon = parseFloat(geocodeData[0].lon);
    logger.info(
      `Coordenadas para o CEP ${cep}: lat=${addressLat}, lon=${addressLon}`
    );

    const nearbyStores = await findNearbyStores(addressLon, addressLat, 100);

    logger.info(
      `Encontradas ${nearbyStores.length} lojas próximas ao CEP ${cep}: endereço: ${addressData.localidade}, ${addressData.logradouro},`
    );

    res.status(200).json({
      status: "success",
      data: {
        nearbyStores,
      },
    });
  } catch (err) {
    logger.error("Erro ao processar a requisição", err);
    res.status(500).json({
      status: "failure",
      message: err,
    });
  }
};

async function findNearbyStores(addressLon, addressLat, radiusInKm = 100) {
  const radiusInMeters = radiusInKm * 1000;
  return await Store.find({
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [addressLon, addressLat] },
        $maxDistance: radiusInMeters,
      },
    },
  });
}

exports.createStore = async (req, res) => {
  const { name, address, location } = req.body;

  if (
    !name ||
    !address ||
    !address.logradouro ||
    !address.bairro ||
    !address.localidade ||
    !address.estado ||
    !location ||
    !location.coordinates ||
    location.type !== "Point"
  ) {
    logger.warn("Dados inválidos para criar uma loja");
    return res
      .status(400)
      .json({ error: "Por favor, informe todos os dados da loja" });
  }

  try {
    const newStore = new Store({ name, address, location });
    await newStore.save();
    logger.info(`Loja "${name}" criada`);
    return res.status(201).json({
      status: "success",
      data: {
        newStore,
      },
    });
  } catch (err) {
    logger.error("Erro ao criar loja", err);
    return res.status(500).json({
      status: "failure",
      message: err,
    });
  }
};
