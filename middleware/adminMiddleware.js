const isAdmin = (req, res, next) => {
    // First ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
  
    // Check if user has admin role
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
  
    // If admin, proceed
    next();
  };
  
module.exports = { isAdmin };