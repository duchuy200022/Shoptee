"use strict";

const { model, Schema, Types } = require("mongoose");

const DOCUMENT_NAME = "Apikey"; //collection name
const COLLECTION_NAME = "Apikeys";

const apiKeySchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    permissions: {
      type: [String],
      required: true,
      enum: ["0000", "1111", "2222"], //0000: dieu kien chung thoa man tat ca api thanh cong
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, apiKeySchema);
