"use strict";

const apikeyModel = require("../models/apikey.model");
const { findById } = require("../services/apikey.service");
// const crypto = require("crypto");

const HEADER = {
  API_KEY: "x-api-key",
  AUTHORIZATION: "authorization",
  CLIENT_ID: "x-client-id",
  REFRESHTOKEN: "refreshtoken",
};

const apiKey = async (req, res, next) => {
  try {
    // console.log("Pass1");
    // const newKey = await apikeyModel.create({
    //   key: crypto.randomBytes(64).toString("hex"),
    //   permissions: "0000",
    // });
    // console.log(newKey);

    if (!req.headers[HEADER.API_KEY]) {
      return res.status(403).json({
        message: "Forbidden Error",
      });
    }

    const key = req.headers[HEADER.API_KEY].toString();
    // console.log("Pass2");

    if (!key) {
      return res.status(403).json({
        message: "Forbidden Error",
      });
    }

    //check objKey
    const objKey = await findById(key);
    if (!objKey) {
      return res.status(403).json({
        message: "Forbidden Error",
      });
    }
    req.objKey = objKey;

    return next();
  } catch (err) {}
};

const permission = (permission) => {
  // closure: tra ve 1 ham ma ham do su dung cac bien cua ham cha
  return (req, res, next) => {
    if (!req.objKey.permissions) {
      return res.status(403).json({
        message: "Permission denied",
      });
    }
    console.log("permission::", req.objKey.permissions);
    const validPermission = req.objKey.permissions.includes(permission);
    if (!validPermission) {
      return res.status(403).json({
        message: "Permission denied",
      });
    }

    return next();
  };
};

const asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};

module.exports = {
  apiKey,
  permission,
  asyncHandler,
};
