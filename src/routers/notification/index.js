"use strict";
const express = require("express");
const { authenticationV2 } = require("../../auth/authUtils");

const { asyncHandler } = require("../../auth/checkAuth");
const notificationController = require("../../controllers/notification.controller");
const router = express.Router();

//not login

//login
router.use(authenticationV2);

router.get("", asyncHandler(notificationController.listNotiByUser));

module.exports = router;
