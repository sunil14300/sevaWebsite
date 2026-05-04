const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.worker = decoded; // { id, registrationId, role }
    next();
  } catch {
    res.status(401).json({ error: "Invalid token." });
  }
};

module.exports = auth;
