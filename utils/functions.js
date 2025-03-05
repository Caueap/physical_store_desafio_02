const axios = require("axios");
const logger = require("../logger");

exports.getAddressByCep = async (cep) => {
  const viacepResponse = await axios.get(
    `https://viacep.com.br/ws/${cep}/json/`
  );
  const addressData = viacepResponse.data;
  if (addressData.erro) {
    logger.warn(`CEP ${cep} not found`);
    throw new Error("CEP not found");
  }
  return addressData;
}

exports.getCoordinates = async (addressData, cep) => {
  const query = encodeURIComponent(
    `${addressData.logradouro}, ${addressData.bairro}, ${addressData.localidade} - ${addressData.uf}`
  );
  const geocodeResponse = await axios.get(
    `https://nominatim.openstreetmap.org/search?q=${query}&format=json`
  );
  const geocodeData = geocodeResponse.data;
  if (!geocodeData || geocodeData.length === 0) {
    logger.warn(`Coordinates not found for CEP ${cep}`);
    throw new Error("Coordinates not found");
  }
  return geocodeData;
}


