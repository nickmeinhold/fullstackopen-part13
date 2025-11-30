const router = require("express").Router();

const { Blog, User } = require("../models");
const { Op } = require("sequelize");
const sessionValidator = require("../middleware/sessionValidator");

router.get("/", async (req, res) => {
  const where = {};

  if (req.query.search) {
    where[Op.or] = [
      {
        title: {
          [Op.iLike]: `%${req.query.search}%`,
        },
      },
      {
        author: {
          [Op.iLike]: `%${req.query.search}%`,
        },
      },
    ];
  }

  orderBy = [["likes", "DESC"]];

  const blogs = await Blog.findAll({
    where,
    order: orderBy,
    attributes: { exclude: ["userId"] },
    include: {
      model: User,
      as: 'User',
      attributes: ["name"],
    },
  });
  res.json(blogs);
});

router.post("/", sessionValidator, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.decodedToken.id);
    const blog = await Blog.create({
      ...req.body,
      userId: user.id,
      date: new Date(),
    });
    res.json(blog);
  } catch (error) {
    next(error);
  }
});

const blogFinder = async (req, res, next) => {
  try {
    req.blog = await Blog.findByPk(req.params.id);
    next();
  } catch (error) {
    return res.status(400).json({ error: 'invalid id' });
  }
};

router.get("/:id", blogFinder, async (req, res) => {
  if (req.blog) {
    res.json(req.blog);
  } else {
    res.status(404).end();
  }
});

router.delete("/:id", sessionValidator, blogFinder, async (req, res) => {
  if (!req.blog) {
    return res.status(404).json({ error: "blog not found" });
  }

  if (req.blog.userId !== req.decodedToken.id) {
    return res
      .status(403)
      .json({ error: "only the creator can delete this blog" });
  }

  await req.blog.destroy();
  res.status(204).end();
});

router.put("/:id", blogFinder, async (req, res) => {
  if (req.blog) {
    req.blog.likes = req.body.likes;
    await req.blog.save();
    res.json(req.blog);
  } else {
    res.status(404).end();
  }
});

module.exports = router;
