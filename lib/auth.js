const auth = require("basic-auth");
require("dotenv").config();

const users = {
  [process.env.ACCESS_USER]: process.env.ACCESS_PASSWORD,
};

function authenticate(req, res, next) {
  const credentials = auth(req);

  // Log de autenticación recibida
  console.log("🔐 Authentication attempt:", {
    method: req.method,
    url: req.url,
    authHeader: req.headers.authorization || "No Authorization header",
    credentials: credentials
      ? {
          username: credentials.name,
          password: credentials.pass,
        }
      : "No credentials parsed",
    timestamp: new Date().toISOString(),
  });

  if (
    !credentials ||
    !users[credentials.name] ||
    users[credentials.name] !== credentials.pass
  ) {
    let failureReason = "No credentials provided";
    if (credentials) {
      failureReason = !users[credentials.name]
        ? "Invalid username"
        : "Invalid password";
    }

    console.log("❌ Authentication failed:", {
      reason: failureReason,
      providedUsername: credentials?.name || "None",
      timestamp: new Date().toISOString(),
    });

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
    `✅ Authentication successful: ${credentials.name} - ${req.method} ${req.url}`
  );
  next();
}

module.exports = authenticate;
