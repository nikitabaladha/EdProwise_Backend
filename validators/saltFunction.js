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

function generateRandomPassword(length = 10) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export default { hashPassword, validatePassword, generateRandomPassword };
