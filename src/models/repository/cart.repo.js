"user strict";

const { convertToObjectIdMongodb } = require("../../utils");
const cartModel = require("../cart.model");

const createUserCart = async ({ userId, product }) => {
  const query = { cart_userId: userId, cart_state: "active" };
  const updateOrInsert = {
    $addToSet: {
      cart_products: product
    }
  };
  const options = { upsert: true, new: true };
  return await cartModel.findOneAndUpdate(query, updateOrInsert, options);
};

const updateUserCartQuantity = async ({ userId, product }) => {
  const { productId, quantity } = product;
  const query = {
    cart_userId: userId,
    // tim kiem xem trong cart co product hay chua
    "cart_products.productId": productId,
    cart_state: "active"
  };
  const options = { upsert: true, new: true };
  const updateSet = {
    $inc: {
      "cart_products.$.quantity": quantity
    }
  };
  return await cartModel.findOneAndUpdate(query, updateSet, options);
};
const findCartById = async (cartId) => {
  return await cartModel
    .findOne({ _id: convertToObjectIdMongodb(cartId), cart_state: "active" })
    .lean();
};

module.exports = { createUserCart, updateUserCartQuantity, findCartById };
