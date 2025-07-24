const auth = require("basic-auth");
require("dotenv").config();

const users = {
  [process.env.ACCESS_USER]: process.env.ACCESS_PASSWORD,
};

function authenticate(req, res, next) {
  const credentials = auth(req);

  if (
    !credentials ||
    !users[credentials.name] ||
    users[credentials.name] !== credentials.pass
  ) {
    res.set("WWW-Authenticate", 'Basic realm="JSON Server Mock API"');
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please provide valid credentials.",
      error: "Unauthorized",
      timestamp: new Date().toISOString(),
      availableUsers: "Contact admin for credentials",
    });
  }

  // User authenticated successfully
  req.user = credentials.name;
  console.log(
    `✅ Authenticated user: ${credentials.name} - ${req.method} ${req.url}`
  );
  next();
}

module.exports = authenticate;
