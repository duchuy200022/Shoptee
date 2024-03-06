"use strict";

const resourceModel = require("../models/resource.model");
const roleModel = require("../models/role.model");

const createResource = async (
  name = "profile",
  slug = "p00001",
  description = ""
) => {
  try {
    // check name or slug exist

    //new resource
    const resource = await resourceModel.create({
      src_name: name,
      src_slug: slug,
      src_description: description
    });

    return resource;
  } catch (error) {
    return error;
  }
};

const resourceList = async ({
  userId = 0, //admin
  limit = 30,
  offset = 0,
  search = ""
}) => {
  try {
    //check admin ? middleware

    //get list of resource
    const resources = await resourceModel.aggregate([
      {
        $project: {
          _id: 0,
          name: "$src_name",
          slug: "$src_slug",
          description: "$src_description",
          resourceId: "$_id",
          createdAt: 1
        }
      }
    ]);

    return resources;
  } catch (error) {
    return error;
  }
};

const createRole = async ({
  name = "shop",
  slug = "s0001",
  description = "extend from shop or user",
  grants = []
}) => {
  try {
    //check role exist

    //
    const role = await roleModel.create({
      rol_name: name,
      rol_slug: slug,
      rol_description: description,
      rol_grants: grants
    });

    return role;
  } catch (error) {
    return error;
  }
};

const roleList = async ({
  userId = 0, //admin
  limit = 30,
  offset = 0,
  search = ""
}) => {
  try {
    // userId

    //list role
    const roles = await roleModel.aggregate([
      {
        $unwind: "$rol_grants"
      },
      {
        $lookup: {
          from: "Resources",
          localField: "rol_grants.resource",
          foreignField: "_id",
          as: "resource"
        }
      },
      {
        $unwind: "$resource"
      },
      {
        $project: {
          role: "$rol_name",
          resource: "$resource.src_name",
          action: "$rol_grants.actions",
          attributes: "$rol_grants.attributes"
        }
      },
      {
        $unwind: "$action"
      },
      {
        $project: {
          _id: 0,
          role: 1,
          resource: 1,
          action: "$action",
          attributes: 1
        }
      }
    ]);

    return roles;
  } catch (error) {}
};

module.exports = {
  createResource,
  resourceList,
  roleList,
  createRole
};
