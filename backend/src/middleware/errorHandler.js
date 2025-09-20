// src/middleware/errorHandler.js

const errorHandler = (err, req, res, next) => {
  // Log the error for debugging
  console.error('Error:', err);

  // Send JSON response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Something went wrong on the server.',
    // Show stack trace only in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
