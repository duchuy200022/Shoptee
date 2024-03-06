const { model, Schema, Types } = require("mongoose");

const DOCUMENT_NAME = "Order"; //collection name
const COLLECTION_NAME = "orders";

const orderSchema = new Schema(
  {
    // se can chinh sua them
    order_userId: {
      type: Number,
      required: true
    },
    order_checkout: {
      /*
      order_checkout: {
        totalPrice,
        totalApplyDiscount,
        feeShip
      }
      */
      type: Object,
      default: {}
    },
    order_shipping: {
      /*
      street,
      city,
      state,
      country
      */
      type: Object,
      default: {}
    },
    order_payment: {
      type: Object,
      default: {}
    },
    order_products: {
      /*
        [
          shopId,
          shop_discounts,
          priceRaw,
          priceApplyDiscount,
          item_products
        ],
        [
          ...
        ]...
      */
      type: Array,
      required: true
    },
    order_trackingNumber: {
      type: String,
      default: "#000"
    },
    order_status: {
      type: String,
      enum: ["peding", "confirmed", "shipped", "cancelled", "delivered"],
      default: ["pending"]
    }
  },
  {
    collection: COLLECTION_NAME,
    timestamps: {
      createdAt: "createdOn",
      updatedAt: "modifiedOn"
    }
  }
);

module.exports = model(DOCUMENT_NAME, orderSchema);
