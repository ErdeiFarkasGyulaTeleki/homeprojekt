import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const bearerToken = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')
    : null;

  const token = bearerToken || req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({ error: 'Hiányzó access token' });
  }

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Érvénytelen vagy lejárt access token' });
    }

    req.user = decoded;

    next();
  });
};