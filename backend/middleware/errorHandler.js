export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Szerveroldali hiba történt';

  res.status(statusCode).json({ message });
};
