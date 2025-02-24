const jwt = require('jsonwebtoken');

const createJWTToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    console.error('JWT_SECRET is not defined in environment variables');
    throw new Error('JWT configuration error');
  }
  
  return jwt.sign(
    { id: userId },
    secret,
    { expiresIn: '3d' } // Match this to your cookie expiration
  );
};

module.exports = createJWTToken;