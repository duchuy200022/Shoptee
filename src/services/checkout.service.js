"use strict";

const { BadRequestError } = require("../core/error.response");
const orderModel = require("../models/order.model");
const { findCartById } = require("../models/repository/cart.repo");
const { checkProductByServer } = require("../models/repository/product.repo");
const { getDiscountAmount } = require("./discount.service");
const { acquireLock, releaseLock } = require("./redis.service");

class CheckoutService {
  /*
    // login and without login
    {
        cartId,
        userId,
        shop_order_ids: [
            {
                shopId,
                shop_discount: [
                    {
                        shopId,
                        discountId,
                        codeId
                    }
                ],
                item_products: [
                    {
                        price,
                        quantity,
                        productId
                    }
                ]
            },
        ]
    }
    */
  static async checkoutReview({ cartId, userId, shop_order_ids = [] }) {
    // check cartId co ton tai khong?
    const foundCart = await findCartById(cartId);
    if (!foundCart) throw new BadRequestError(`Cart does not exist`);

    const checkout_order = {
      totalPrice: 0, // tong tien hang
      feeShip: 0,
      totalDiscount: 0, // tong tien discount giam gia
      totalCheckout: 0 // tong thanh toan
    };

    const shop_order_ids_new = [];

    // tinh tong tien bill
    for (let i = 0; i < shop_order_ids.length; i++) {
      const {
        shopId,
        shop_discounts = [],
        item_products = []
      } = shop_order_ids[i];
      // check product hop le
      const checkProductServer = await checkProductByServer(item_products);
      if (!checkProductServer[0]) {
        throw new BadRequestError(`Order Wrong!!`);
      }

      //tong tien don hang
      const checkoutPrice = checkProductServer.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      }, 0);

      //tong tien truoc khi xu li
      checkout_order.totalPrice += checkoutPrice;

      const itemCheckout = {
        shopId,
        shop_discounts,
        priceRaw: checkoutPrice,
        priceApplyDiscount: checkoutPrice,
        item_products: checkProductServer
      };

      // neu shop_discounts ton tai > 0, check xxem co hop le hay khong
      if (shop_discounts.length > 0) {
        // gia su chi co mot discount
        const { totalPrice = 0, discount = 0 } = await getDiscountAmount({
          codeId: shop_discounts[0].codeId,
          userId,
          shopId,
          products: checkProductServer
        });

        // tong cong discount giam gia
        checkout_order.totalDiscount += discount;
        if (discount > 0) {
          itemCheckout.priceApplyDiscount = checkoutPrice - discount;
        }
      }

      checkout_order.totalCheckout += itemCheckout.priceApplyDiscount;
      shop_order_ids_new.push(itemCheckout);
    }

    return {
      shop_order_ids,
      shop_order_ids_new,
      checkout_order
    };
  }

  //order
  static async orderByUser({
    shop_order_ids_new,
    cartId,
    userId,
    user_address = {},
    user_payment = {}
  }) {
    const { shop_order_ids_new, checkout_order, shop_order_ids_new } =
      await CheckoutService.checkoutReview({
        cartId,
        userId,
        shop_order_ids: shop_order_ids_new
      });

    // check vuot ton kho hay khong ?
    const products = shop_order_ids_new.flatMap((order) => order.item_products);
    const acquireProduct = [];

    for (let i = 0; i < products.length; i++) {
      const { productId, quantity } = products[i];
      const keyLock = await acquireLock({ productId, quantity, cartId });
      acquireProduct.push(keyLock ? true : false);
      if (keyLock) {
        await releaseLock(keyLock);
      }
    }

    if (acquireProduct.includes(false)) {
      throw new BadRequestError(
        `Mot so san pham da duoc cap nhat, vui long quay lai gio hang`
      );
    }

    const newOrder = orderModel.create({
      order_userId: userId,
      order_checkout: checkout_order,
      order_shipping: user_address,
      order_payment: user_payment,
      order_products: shop_order_ids_new
    });

    // Truong hop Neu insert thanh cong, thi remove product co trong cart
    if (newOrder) {
      //remove product in cart
    }

    return newOrder;
  }

  /*
  Query Order( user)
  */
  static async getOrdersByUser() {}

  static async getOneOrdersByUser() {}

  static async cancelOrderByUser() {}

  static async updateStatusByShop() {}
}

module.exports = CheckoutService;
