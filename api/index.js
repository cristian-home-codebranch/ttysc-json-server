const { createServer } = require("../lib/server");
const path = require("path");

const server = createServer(path.join(__dirname, "..", "db", "db.json"));

// Export the server as a Vercel serverless function
module.exports = server;
