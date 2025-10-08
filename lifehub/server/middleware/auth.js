// Simple auth middleware for development
// In production, you would verify Firebase tokens here
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  // Use the token as userId directly (Firebase UID)
  req.userId = token;
  console.log('Auth middleware - userId:', req.userId); // Debug log
  next();
};

export default authMiddleware;