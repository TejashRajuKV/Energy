/**
 * Global error handler middleware for Express
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}`, err.message);

  // Zod validation errors
  if (err.name === 'ZodError' || err.issues) {
    return res.status(400).json({
      error: 'Validation failed',
      details: (err.errors || err.issues || []).map((e) => ({
        field: e.path ? e.path.join('.') : 'unknown',
        message: e.message,
      })),
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }

  // Prisma known errors
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    return res.status(409).json({ error: `A record with this ${field} already exists` });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found' });
  }

  // Default
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';
  return res.status(status).json({ error: message });
};

/**
 * 404 handler for unmatched routes
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
};

module.exports = { errorHandler, notFoundHandler };
