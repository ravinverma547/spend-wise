const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware
 * Verifies the JWT token from the Authorization header
 */
const auth = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No authentication token, authorization denied' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token verification failed, authorization denied' 
      });
    }

    // Add user ID to request object
    req.user = decoded.id;
    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err.message);
    res.status(401).json({ 
      success: false, 
      message: 'Token is invalid or expired' 
    });
  }
};

module.exports = auth;
