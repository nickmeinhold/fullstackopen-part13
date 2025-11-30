const router = require("express").Router();
const jwt = require("jsonwebtoken");

const { ReadingList } = require("../models");
const { SECRET } = require("../utils/config");

const tokenExtractor = (req, res, next) => {
  const authorization = req.get("authorization");
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    try {
      req.decodedToken = jwt.verify(authorization.substring(7), SECRET);
    } catch (error) {
      return res.status(401).json({ error: "token invalid" });
    }
  } else {
    return res.status(401).json({ error: "token missing" });
  }
  next();
};

// Add blog to reading list
router.post("/", tokenExtractor, async (req, res) => {
  const { blogId } = req.body;

  const readingList = await ReadingList.create({
    userId: req.decodedToken.id,
    blogId,
    read: false,
  });

  res.json(readingList);
});

// Mark blog as read
router.put("/:id", tokenExtractor, async (req, res) => {
  const readingListEntry = await ReadingList.findByPk(req.params.id);

  if (!readingListEntry) {
    return res.status(404).json({ error: 'reading list entry not found' });
  }

  // Only the user who added it can mark it as read
  if (readingListEntry.userId !== req.decodedToken.id) {
    return res.status(403).json({ error: 'not authorized' });
  }

  readingListEntry.read = req.body.read;
  await readingListEntry.save();

  res.json(readingListEntry);
});

module.exports = router;
