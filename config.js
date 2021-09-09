let config;

try {
  config = require("./config.json");
} catch {
  config = null;
}

module.exports = {
  token: config ? config.token : process.env.token,
  radioToken: config ? config.radioToken : process.env.radioToken,
  spotifyClientId: config ? config.spotifyClientId : process.env.spotifyClientId,
  spotifyToken: config ? config.spotifyToken : process.env.spotifyToken,
};
