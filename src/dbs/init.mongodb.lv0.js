"use strict";

const mongoose = require("mongoose");

const connectString = "mongodb://127.0.0.1:27017/shopDev";

mongoose
  .connect(connectString)
  .then(() => console.log("Connected MongoDb Success"))
  .catch((err) => console.log(err));

// dev environment
if (1 === 1) {
  mongoose.set("debug", true);
  mongoose.set("debug", { color: true });
}
module.exports = mongoose;
