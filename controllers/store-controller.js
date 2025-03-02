const axios = require("axios");
const logger = require("../logger");
const Store = require("../models/store-model");

exports.getStores = async (req, res) => {
  const cep = req.query.cep;

  if (!cep) {
    logger.warn("CEP não informado na requisição");
    return res.status(400).json({
      error: "CEP não informado",
    });
  }

  try {
    const viacepResponse = await axios.get(
      `https://viacep.com.br/ws/${cep}/json/`
    );
    const addressData = viacepResponse.data;
    if (addressData.erro) {
      logger.warn(`CEP ${cep} não encontrado`);
      return res.status(404).json({ error: "CEP não encontrado" });
    }

    const query = encodeURIComponent(
      `${addressData.logradouro}, ${addressData.bairro}, ${addressData.localidade} - ${addressData.uf}`
    );
    const geocodeResponse = await axios.get(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json`
    );
    const geocodeData = geocodeResponse.data;
    if (!geocodeData || geocodeData.length === 0) {
      logger.warn(`Coordenadas não encontradas para o CEP ${cep}`);
      return res.status(404).json({ error: "Coordenadas não encontradas" });
    }

    const userLat = parseFloat(geocodeData[0].lat);
    const userLon = parseFloat(geocodeData[0].lon);
    logger.info(
      `Coordenadas para o CEP ${cep}: lat=${userLat}, lon=${userLon}`
    );

    const radiusInKm = 100;
    const radiusInMeters = radiusInKm * 1000;
    const nearbyStores = await Store.find({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [userLon, userLat] },
          $maxDistance: radiusInMeters,
        },
      },
    });

    logger.info(
      `Encontradas ${nearbyStores.length} lojas próximas ao CEP ${cep}: endereço: ${addressData.localidade}, ${addressData.logradouro},`
    );
    return res.json(nearbyStores);
  } catch (error) {
    logger.error("Erro ao processar a requisição", error);
    return res.status(500).json({ error: "Erro ao processar a requisição" });
  }
};

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
    return res.status(400).json({ error: "Dados inválidos" });
  }

  try {
    const newStore = new Store({ name, address, location });
    await newStore.save();
    logger.info(`Loja "${name}" criada`);
    return res.status(201).json(newStore);
  } catch (error) {
    logger.error("Erro ao criar loja", error);
    return res.status(500).json({ error: "Erro ao criar loja" });
  }
};
