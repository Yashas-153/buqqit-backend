const prisma = require('../database/prismaPostgress');
const jwt = require('jsonwebtoken');
const isHost = async (req, res, next) => {
  // console.log(req.body.userId)
  const userId = parseInt(req.body.userId); // Assuming user_id is passed in the request body
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if(user && user.user_type === 'HOST') {
      next();
    } 
    else{
      res.status(403).json({ error: 'Access forbidden: Hosts only' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify user type' });
  }
};

const isUser = async (req, res, next) => {
  // console.log(req.body.userId)
  const { userId } = req.body; // Assuming user_id is passed in the request body
  console.log("userId is ",userId)
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if(user && user.user_type === 'USER') {
      next();
    } 
    else{
      res.status(403).json({ error: 'Access forbidden: User only' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify user type' });
  }
};


const isAuthenticated = async (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies.token;
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Please login to access this resource' 
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded)
    // Find user in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });
    console.log("user is ",user)
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Check if user is verified (if you want to enforce email verification)
    // if (!user.verified) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Please verify your email to continue'
    //   });
    // }
    
    // Attach user to request object
    req.user = user;
    
    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Optional: Role-based middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.user_type)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.user.user_type}) is not allowed to access this resource`
      });
    }
    next();
  };
};

module.exports = {isHost,isUser, isAuthenticated, authorizeRoles};
