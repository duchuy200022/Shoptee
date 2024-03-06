"user strict";

const express = require("express");
const { asyncHandler } = require("../../auth/checkAuth");
const { authenticationV2 } = require("../../auth/authUtils");
const {
  newRole,
  newResouce,
  listRole,
  listResource
} = require("../../controllers/rbac.controller");

const router = express.Router();

router.post("/role", asyncHandler(newRole));
router.post("/resource", asyncHandler(newResouce));

router.get("/roles", asyncHandler(listRole));
router.get("/resources", asyncHandler(listResource));

module.exports = router;
