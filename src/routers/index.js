"use strict";

const express = require("express");
const { apiKey, permission } = require("../auth/checkAuth");

const router = express.Router();

//check apiKey
router.use(apiKey);

//check permission
router.use(permission("0000")); //0000: quyen chung
//rbac
router.use("/v1/api/rbac", require("./rbac"));

// product
router.use("/v1/api/product", require("./product"));

//discount
router.use("v1/api/discount", require("./discount"));

//inventory
router.use("v1/api/inventory", require("./inventory"));

//comment
router.use("v1/api/comment", require("./comment"));

//cart
router.use("v1/api/cart", require("./cart"));

//checkout
router.use("v1/api/checkout", require("./checkout"));

//noti
router.use("/v1/api/notification", require("./notification"));

//profile
router.use("v1/api/profile", require("./profile"));
//access
router.use("/v1/api", require("./access"));

module.exports = router;
