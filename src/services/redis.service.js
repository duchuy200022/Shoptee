"use strict";

const redis = require("redis");
const { promisify } = require("util");
const { reservationInventory } = require("../models/repository/inventory.repo");

const redisClient = redis.createClient();

const pexpire = promisify(redisClient.pExpire).bind(redisClient);
const setnxAsync = promisify(redisClient.setNX).bind(redisClient);
const delAsyncKey = promisify(redisClient.del).bind(redisClient);

const acquireLock = async ({ productId, quantity, cartId }) => {
  const key = `lock_v2023_${productId}`;
  const retryTime = 10;
  const expireTime = 5000;

  for (let i = 0; i < retryTime; i++) {
    // Tao key
    const result = await setnxAsync(key, expireTime);
    if (result == 1) {
      const isReservation = reservationInventory({
        productId,
        quantity,
        cartId
      });
      if ((await isReservation).modifiedCount) {
        await pexpire(key, expireTime);
        return key;
      }
    } else {
      await new Promise((resolve) => {
        setTimeout(resolve, 50);
      });
    }
  }
  return null;
};

const releaseLock = async (keyLock) => {
  return await delAsyncKey(keyLock);
};

module.exports = { acquireLock, releaseLock };
