const router = require("express").Router();
const { Session } = require("../models");
const sessionValidator = require("../middleware/sessionValidator");

router.delete("/", sessionValidator, async (req, res) => {
  const authorization = req.get("authorization");
  const token = authorization.substring(7);

  // Delete the session from database
  await Session.destroy({
    where: { token },
  });

  res.status(204).end();
});

module.exports = router;
