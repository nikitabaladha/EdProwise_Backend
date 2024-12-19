// const crypto = require("crypto");
import crypto from "crypto";

function hashPassword(password) {
  const salt = crypto.randomBytes(32).toString("hex");
  const hashedPassword = crypto
    .pbkdf2Sync(password, salt, 1000, 64, `sha512`)
    .toString(`hex`);
  return { hashedPassword, salt };
}

function validatePassword(plainPassword, hashedPassword, salt) {
  const encryptedPassword = crypto
    .pbkdf2Sync(plainPassword, salt, 1000, 64, `sha512`)
    .toString(`hex`);
  return encryptedPassword === hashedPassword;
}

export default { hashPassword, validatePassword };
