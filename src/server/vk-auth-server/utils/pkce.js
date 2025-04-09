// utils/pkce.js
const crypto = require("crypto");

function base64url(input) {
  return input
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function generatePKCE() {
  const code_verifier = base64url(crypto.randomBytes(32));
  const code_challenge = base64url(
    crypto.createHash("sha256").update(code_verifier).digest(),
  );
  return { code_verifier, code_challenge };
}

module.exports = { generatePKCE };
