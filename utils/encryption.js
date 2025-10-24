const crypto = require("crypto");

// AES-256-CBC requires 32-byte key and 16-byte IV
const algorithm = "aes-256-cbc";
const secretKey = process.env.QR_SECRET_KEY; // 32 chars
const ivLength = 16;

function encryptId(text) {
  const iv = crypto.randomBytes(ivLength); // unique IV per encryption
  const cipher = crypto.createCipheriv(
    algorithm,
    Buffer.from(secretKey, "utf-8"),
    iv
  );
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted; // store IV with ciphertext
}

function decryptId(encryptedText) {
  const [ivHex, encrypted] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(secretKey, "utf-8"),
    iv
  );
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

module.exports = { encryptId, decryptId };
