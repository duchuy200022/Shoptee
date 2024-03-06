"use strict";

const { model, Schema, Types } = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Resource"; //collection name
const COLLECTION_NAME = "Resources";

const resourceSchema = new Schema(
  {
    src_name: { type: String, required: true }, //profile
    src_slug: { type: String, required: true }, //000001
    src_description: { type: String, default: "" }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

module.exports = model(DOCUMENT_NAME, resourceSchema);
