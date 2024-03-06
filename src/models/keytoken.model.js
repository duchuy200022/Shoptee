"use strict";

//!dmbg
const { model, Schema, Types } = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Key"; // database
const COLLECTION_NAME = "Keys"; // table

// Declare the Schema of the Mongo model

const keyTokenSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Shop",
    },
    privateKey: {
      type: String,
      required: true,
    },
    publicKey: {
      type: String,
      required: true,
    },
    refreshTokensUsed: {
      type: Array,
      default: [],
    },
    refreshToken: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, keyTokenSchema); // colection: keys
