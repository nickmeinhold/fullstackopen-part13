const router = require("express").Router();

const { User, Blog } = require("../models");

router.get("/", async (req, res) => {
  const users = await User.findAll({
    include: [
      {
        model: Blog,
        attributes: { exclude: ["userId"] },
      },
      {
        model: Blog,
        as: "readings",
        attributes: { exclude: ["userId"] },
        through: {
          attributes: ["id", "read"],
        },
      },
    ],
  });
  res.json(users);
});

router.post("/", async (req, res) => {
  const user = await User.create(req.body);
  res.json(user);
});

router.get("/:id", async (req, res) => {
  // Build the readings include options
  const readingsInclude = {
    model: Blog,
    as: "readings",
    attributes: { exclude: ["userId"] },
    through: {
      attributes: ["id", "read"],
    },
  };

  // Add where clause if read parameter is provided
  if (req.query.read !== undefined) {
    readingsInclude.through.where = {
      read: req.query.read === 'true'
    };
  }

  const user = await User.findByPk(req.params.id, {
    include: [
      {
        model: Blog,
        attributes: { exclude: ["userId"] },
      },
      readingsInclude,
    ],
  });

  if (user) {
    res.json(user);
  } else {
    res.status(404).end();
  }
});

router.put("/:username", async (req, res) => {
  const user = await User.findOne({ where: { username: req.params.username } });
  if (user) {
    user.username = req.body.username;
    await user.save();
    res.json(user);
  } else {
    res.status(404).end();
  }
});

module.exports = router;
