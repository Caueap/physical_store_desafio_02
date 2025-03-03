const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    logradouro: { type: String, required: true },
    complemento: String,
    bairro: { type: String, required: true },
    localidade: { type: String, required: true },
    estado: { type: String, required: true },
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
});

storeSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Store", storeSchema);
