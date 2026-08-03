const jwt = require("jsonwebtoken");

/**
 * Generates a signed JWT for a given user ID.
 * Payload stays minimal — just the id — everything else is fetched from DB when needed.
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

module.exports = generateToken;