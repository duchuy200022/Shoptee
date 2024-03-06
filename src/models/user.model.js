"use strict";

const { model, Schema, Types } = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "User"; //collection name
const COLLECTION_NAME = "Users";

const userSchema = new Schema(
  {
    usr_id: { type: Number, required: true },
    usr_slug: { type: String, required: true },
    usr_password: { type: String, required: true },
    usr_role: { type: Schema.Types.ObjectId, ref: "Role" }, // admin shop user
    usr_status: {
      type: String,
      default: "pending",
      enum: ["pending", "active", "block"]
    },
    usr_name: { type: String, default: "" },
    usr_phone: { type: String, default: "" },
    usr_salf: { type: String, default: "" },
    usr_sex: { type: String, default: "" },
    usr_date_of_birth: { type: String, default: "" },
    usr_email: { type: String, required: true }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

module.export = model(DOCUMENT_NAME, userSchema);
