// Simple auth middleware for development
// In production, you would verify Firebase tokens here
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  // For development, we'll use the token as userId directly
  // In production, you would verify the Firebase token and extract the UID
  req.userId = token;
  next();
};

export default authMiddleware;