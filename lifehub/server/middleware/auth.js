// Simple auth middleware for development
// In production, you would verify Firebase tokens here
const authMiddleware = (req, res, next) => {
  // Temporarily disable auth for testing
  req.userId = 'test-user-123';
  next();
};

// Original auth (commented out for testing)
// const authMiddleware = (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     return res.status(401).json({ error: 'No token provided' });
//   }
//   const token = authHeader.substring(7);
//   req.userId = token;
//   next();
// };

export default authMiddleware;