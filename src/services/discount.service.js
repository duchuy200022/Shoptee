"user strict";

const { BadRequestError, NotFoundError } = require("../core/error.response");
const discountModel = require("../models/discount.model");
const {
  findAllDiscountCodesUnSelect,
  checkDiscountExist,
  findAllDiscountCodesSelect,
} = require("../models/repository/discount.repo");
const { findAllProducts } = require("../models/repository/product.repo");
const { convertToObjectIdMongodb } = require("../utils");

/**
 * Discount Services:
 * 1 - Generator Discount Code (Shop | Admin)
 * 2 - Get discount amount (User)
 * 3 - Get all discount codes (Shop)
 * 4 - Verify discount code (User)
 * 5 - Delete discount code(Admin | Shop)
 * 6 - Cancel discount code (user)
 */

class DiscountService {
  static async createDiscountCode(payload) {
    const {
      code,
      start_date,
      end_date,
      is_active,
      shopId,
      min_order_value,
      product_ids,
      applies_to,
      name,
      description,
      type,
      value,
      max_value,
      max_uses,
      uses_count,
      max_uses_per_user,
      users_used,
    } = payload;
    // kiem tra

    if (new Date(start_date) > new Date(end_date)) {
      throw new BadRequestError(`Start date must be before end_date`);
    }

    //create index for discount code
    const foundDiscount = await discountModel
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectIdMongodb(shopId),
      })
      .lean();
    if (foundDiscount && foundDiscount.discount_is_active) {
      throw new BadRequestError(`Discount exists`);
    }
    const newDiscount = await discountModel.create({
      discount_name: name,
      discount_description: description,
      discount_type: type,
      discount_code: code,
      discount_value: value,
      discount_min_order_value: min_order_value,
      discount_max_value: max_value,
      discount_start_date: new Date(start_date),
      discount_end_date: new Date(end_date),
      discount_max_uses: max_uses,
      discount_uses_count: uses_count,
      discount_users_used: users_used,
      discount_shopId: shopId,
      discount_max_uses_per_user: max_uses_per_user,
      discount_is_active: is_active,
      discount_applies_to: applies_to,
      discount_product_ids: applies_to === "all" ? [] : product_ids,
    });

    return newDiscount;
  }

  static async updateDiscountCode() {
    //...
  }

  // lay ra danh sach san pham phu hop voi discount
  static async getAllDiscountCodeWithProduct({ code, shopId, limit, page }) {
    // create index for discount_code
    const foundDiscount = await discountModel
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectIdMongodb(shopId),
      })
      .lean();
    if (!foundDiscount || !foundDiscount.discount_is_active) {
      throw new NotFoundError("Discount not exist");
    }

    const { discount_applies_to, discount_product_ids } = foundDiscount;
    let products;
    if (discount_applies_to === "all") {
      //get all product of shop
      products = findAllProducts({
        filter: {
          product_shop: convertToObjectIdMongodb(shopId),
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }

    if (discount_applies_to === "specific") {
      products = findAllProducts({
        filter: {
          _id: { $in: discount_product_ids },
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }
    return products;
  }

  static async getAllDiscountCodeByShop({ limit, page, shopId }) {
    const discounts = await findAllDiscountCodesSelect({
      limit: +limit,
      page: +page,
      filter: {
        discount_shopId: shopId,
        discount_is_active: true,
      },
      select: ["discount_code", "discount_name"],
      model: discountModel,
    });
    return discounts;
  }

  /**
   * Apply Discount code
   * products = [
   * {
   *    productId,
   *    shopId,
   *    quantity,
   *    name,
   *    price
   * }, ...
   * ]
   */
  static async getDiscountAmount({ codeId, userId, shopId, products }) {
    const foundDiscount = await checkDiscountExist(discountModel, {
      discount_code: codeId,
      discount_shopId: convertToObjectIdMongodb(shopId),
    });
    if (!foundDiscount) throw new NotFoundError(`discount doesn't exist`);

    const {
      discount_is_active,
      discount_max_uses,
      discount_start_date,
      discount_end_date,
      discount_min_order_value,
      discount_users_used,
      discount_value,
      discount_max_uses_per_user,
      discount_type,
    } = foundDiscount;

    if (!discount_is_active) {
      throw new NotFoundError(`Discount expired`);
    }
    if (!discount_max_uses) {
      throw new NotFoundError(`Discount are out`);
    }
    if (
      new Date() < new Date(discount_start_date) ||
      new Date() > new Date(discount_end_date)
    )
      throw new NotFoundError(`Discount code has expired`);

    let totalOrder = 0;
    if (discount_min_order_value > 0) {
      totalOrder = products.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      }, 0);
    }
    if (totalOrder < discount_min_order_value)
      throw new NotFoundError(
        `Discount requires a minimum order value of ${discount_min_order_value}`
      );

    if (discount_max_uses_per_user > 0) {
      userUseDiscount = discount_users_used.find(
        (user) => user.userId === userId
      );
      if (userUseDiscount) {
        //...
      }
    }

    const amount =
      discount_type === "fixed_ammount"
        ? discount_value
        : (totalOrder * discount_value) / 100;

    return {
      totalOrder,
      discount: amount,
      totalPrice: totalOrder - amount,
    };
  }

  // khong co delete
  // phuong an 1: dua vao 1 database history de hoan tac
  // phuong an 2: them 1 truong discount_is_deleted
  // => chon phuong an 1
  static async deleteDiscountCode({ shopId, codeId }) {
    const deleted = await discountModel.findOneAndDelete({
      discount_code: codeId,
      discount_shopId: shopId,
    });
    return deleted;
  }

  static async cancelDiscountCode({ codeId, shopId, userId }) {
    const foundDiscount = await checkDiscountExist(discountModel, {
      discount_code: codeId,
      discount_shopId: shopId,
    });
    if (!foundDiscount) {
      throw new NotFoundError(`Discount doesn't exist`);
    }

    const result = await discountModel.findByIdAndUpdate(foundDiscount._id, {
      $pull: {
        discount_users_used: userId,
      },
      $inc: {
        discount_max_uses: 1,
        discount_uses_count: -1,
      },
    });
    return result;
  }
}
module.exports = DiscountService;
