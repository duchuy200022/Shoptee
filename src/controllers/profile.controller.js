"use strict";

const { SuccessResponse } = require("../core/success.response");

const profiles = [
  {
    usr_id: 1,
    usr_name: "CR7",
    usr_avt: "image.com/user/1"
  },
  {
    usr_id: 2,
    usr_name: "CR8",
    usr_avt: "image.com/user/2"
  },
  {
    usr_id: 3,
    usr_name: "CR9",
    usr_avt: "image.com/user/3"
  }
];

class ProfileController {
  //admin
  profiles = async (req, res, next) => {
    new SuccessResponse({
      message: "view all profiles",
      metadata: profiles
    }).send(res);
  };

  //shop
  profile = async (req, res, next) => {
    new SuccessResponse({
      message: "view One profile",
      metadata: profiles[0]
    }).send(res);
  };
}

module.exports = new ProfileController();
