"use strict";

const os = require("os");
const process = require("process");
const mongoose = require("mongoose");
const _SECONDS = 5000;

// count Connect
const countConnect = () => {
  const numConnection = mongoose.connections.length;
  console.log(`Number of Connection::${numConnection}`);
};

//check Overload
const checkOverload = () => {
  setInterval(() => {
    const numConnection = mongoose.connections.length;
    const numCores = os.cpus().length;
    const memoryUsage = process.memoryUsage().rss;

    // Example maximum number of connections based on the number of cores
    const maxConnection = numCores * 5;

    console.log(`Active connections::${numConnection}`);
    console.log(`Memory Usage::${memoryUsage / 1024 / 1024} MB`);

    if (numConnection > maxConnection) {
      console.log(`Connection overload detected!`);
    }
  }, 50000);
};
module.exports = { countConnect, checkOverload };
