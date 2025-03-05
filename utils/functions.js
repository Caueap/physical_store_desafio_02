const axios = require("axios");
const logger = require("./logger");

exports.getAddressByCep = async (cep, res) => {
  const viacepResponse = await axios.get(
    `https://viacep.com.br/ws/${cep}/json/`
  );
  const addressData = viacepResponse.data;
  if (addressData.erro) {
    logger.warn(`CEP ${cep} not found`);
    return res.status(404).json({ error: "CEP não encontrado" });
  }
  return addressData;
}

exports.getCoordinates = async (addressData, cep, res) => {
  const query = encodeURIComponent(
    `${addressData.logradouro}, ${addressData.bairro}, ${addressData.localidade} - ${addressData.uf}`
  );
  const geocodeResponse = await axios.get(
    `https://nominatim.openstreetmap.org/search?q=${query}&format=json`
  );
  const geocodeData = geocodeResponse.data;
  if (!geocodeData || geocodeData.length === 0) {
    logger.warn(`Coordinates not found for CEP ${cep}`);
    return res.status(404).json({ error: "Coordenadas não encontradas" });
  }
  return geocodeData;
}

exports.cepValidatorForDigitsLength = (cep, res) => {
  if (cep.length !== 8) {
    logger.warn('O cep precisa ter 8 dígitos')
    return res.status(400).json({ error: "O cep informado precisa ter 8 dígitos" });
  }
}

exports.cepValidatorForNumbersOnly = (cep, res) => {
  if (!(/^\d+$/.test(cep))) {
    logger.warn('O cep deve conter apenas números')
    return res.status(400).json({ error: "O cep informado deve conter apenas números" });
  }
}