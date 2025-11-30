const router = require("express").Router();

const { ReadingList } = require("../models");
const sessionValidator = require("../middleware/sessionValidator");

// Add blog to reading list
router.post("/", sessionValidator, async (req, res) => {
  const { blogId } = req.body;

  const readingList = await ReadingList.create({
    userId: req.decodedToken.id,
    blogId,
    read: false,
  });

  res.json(readingList);
});

// Mark blog as read
router.put("/:id", sessionValidator, async (req, res) => {
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
