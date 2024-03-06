"user strict";

const express = require("express");
const { asyncHandler } = require("../../auth/checkAuth");
const discountController = require("../../controllers/discount.controller");
const { authenticationV2 } = require("../../auth/authUtils");

const router = express.Router();

router.post("/amount", asyncHandler(discountController.getDiscountAmount));
router.get(
  "/list_product_code",
  asyncHandler(discountController.getAllDiscountCodesWithProducts)
);

// authentication

router.use(authenticationV2);

router.post("", asyncHandler(discountController.createDiscountCode));
router.get("", asyncHandler(discountController.getAllDiscountCodes));

module.exports = router;
