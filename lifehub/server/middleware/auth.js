// Auth middleware that uses Firebase user ID
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.substring(7);
  req.userId = token; // This is the Firebase user UID
  next();
};

export default authMiddleware;