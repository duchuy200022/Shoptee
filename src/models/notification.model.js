"use strict";

const { model, Schema, Types } = require("mongoose");

const DOCUMENT_NAME = "Notification"; //collection name
const COLLECTION_NAME = "Notifications";

//ORDER-001: order-successfully
//ORDER-002: order-failed
//PROMOTION-001: new promotion
//SHOP-001: new product by User follow

const notificationSchema = new Schema(
  {
    noti_type: {
      type: String,
      enum: ["ORDER-01", "ORDER-002", "PROMOTION-001", "SHOP-001"],
      required: true
    },
    noti_senderId: {
      type: Types.ObjectId,
      required: true,
      ref: "Shop"
    },
    noti_receivedId: {
      type: Number,
      required: true
    },
    noti_content: {
      type: String,
      required: true
    },
    noti_options: {
      type: Object,
      default: {}
    }
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true
  }
);

module.exports = model(DOCUMENT_NAME, notificationSchema);
