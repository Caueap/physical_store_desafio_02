const storeService = require("../services/store-service");

exports.getStores = async (req, res) => {
  return storeService.getStores(req, res);
};

exports.createStore = async (req, res) => {
  return storeService.createStore(req, res);
};
