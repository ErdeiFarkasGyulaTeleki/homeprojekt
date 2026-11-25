import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const bearerToken = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : null;

  const token = bearerToken || req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({ message: 'Hiányzó access token' });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Érvénytelen vagy lejárt access token' });
    }

    req.user = decoded;

    next();
  });
};