require("express-async-errors");
const express = require("express");
const app = express();

const { PORT } = require("./utils/config");
const { connectToDatabase } = require("./utils/db");

const blogsRouter = require("./controllers/blogs");
const usersRouter = require("./controllers/users");
const loginRouter = require("./controllers/login");

app.use(express.json());

app.use("/api/blogs", blogsRouter);
app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error caught by middleware:", err.message);

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: err.errors.map(e => e.message)
    });
  }

  // Handle other Sequelize errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      error: err.errors.map(e => e.message)
    });
  }

  // Default error response
  res.status(500).json({
    error: err.message
  });
});

const start = async () => {
  await connectToDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
