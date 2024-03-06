"use strict";

const { NotFoundError } = require("../core/error.response");
const cartModel = require("../models/cart.model");
const {
  createUserCart,
  updateUserCartQuantity
} = require("../models/repository/cart.repo");
const { getProductById } = require("../models/repository/product.repo");

/**
 * - add product to cart
 * - reduce product quantity by 1 (User)
 * - increase product quantity by one (User)
 * - Get Cart (User)
 * - Delete Cart (User)
 * - Delete Cart Item User
 */

class CartService {
  static async addToCart({ userId, product = {} }) {
    //check cart co ton tai khong ?
    const userCart = await cartModel.findOne({ cart_userId: userId });
    if (!userCart) {
      //create cart for User
      return await createUserCart({ userId, product });
    }

    // Neu co gio hang nhung chua co san pham
    if (!userCart.cart_products.length) {
      userCart.cart_products = [product];
      return await userCart.save();
    }

    //Neu gio hang ton tai va co san pham nay thi update quantity
    return await updateUserCartQuantity({ userId, product });
  }

  /*
	shop_order_ids: [
		{
			shopId,
			item_products: [
				{
					quantity,
					price,
					old_quantity,
					productId,
				}
			], 
			version
		}
	]
	*/
  static async addToCartV2({ userId, shop_order_ids }) {
    const { productId, quantity, old_quantity } =
      shop_order_ids[0]?.item_products[0];
    // check product
    const foundProduct = await getProductById(productId);
    if (!foundProduct) throw new NotFoundError(`Product not exist`);
    //compare
    if (foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId) {
      throw new NotFoundError(`Product does not belong to the shop`);
    }
    if (quantity === 0) {
      //delete
    }

    //update User Cart
    return await updateUserCartQuantity({
      userId,
      product: {
        productId,
        quantity: quantity - old_quantity
      }
    });
  }

  static async deleteUserCart({ userId, productId }) {
    const query = { cart_userId: userId, cart_state: "active" };
    const updateSet = {
      $pull: {
        cart_products: {
          productId
        }
      }
    };
    const deleteCart = await cartModel.updateOne(query, updateSet);
    return deleteCart;
  }

  static async getListUserCart({ userId }) {
    return await cartModel.findOne({ cart_userId: +userId }).lean();
  }
}

module.exports = CartService;
