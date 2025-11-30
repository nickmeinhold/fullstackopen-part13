const jwt = require("jsonwebtoken");
const { Session, User } = require("../models");
const { SECRET } = require("../utils/config");

const sessionValidator = async (req, res, next) => {
  const authorization = req.get("authorization");

  if (!authorization || !authorization.toLowerCase().startsWith("bearer ")) {
    return res.status(401).json({ error: "token missing" });
  }

  const token = authorization.substring(7);

  try {
    // Verify the JWT token
    const decodedToken = jwt.verify(token, SECRET);
    req.decodedToken = decodedToken;

    // Check if session exists in database
    const session = await Session.findOne({
      where: { token },
    });

    if (!session) {
      return res.status(401).json({ error: "session expired or invalid" });
    }

    // Check if user exists and is not disabled
    const user = await User.findByPk(decodedToken.id);

    if (!user) {
      return res.status(401).json({ error: "user not found" });
    }

    if (user.disabled) {
      return res.status(401).json({ error: "account disabled" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: "token invalid" });
  }
};

module.exports = sessionValidator;
