const errorHandler = (err, _req, res, _next) => {
  console.error('Error caught by middleware:', err.name, err.message);

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: err.errors.map((e) => e.message),
    });
  }

  // Handle Sequelize database errors
  if (err.name === 'SequelizeDatabaseError') {
    return res.status(400).json({
      error: err.message,
    });
  }

  // Handle other Sequelize errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      error: err.errors.map((e) => e.message),
    });
  }

  // Default error response
  res.status(500).json({
    error: err.message,
  });
};

module.exports = errorHandler;
