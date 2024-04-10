const jwt = require('jsonwebtoken');

const authenticateAdmin = (req, res, next) => {
  try {
    // Extract the token from the Authorization header
    const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : '';
    // Verify the token
    const decodedToken = jwt.verify(token, 'TOUCHING_DEVELOPMENT_ADMIN_SYSTEM_178');
    // Attach the decoded token to the request for further use
    req.userData = { userId: decodedToken.userId, username: decodedToken.username };
    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    console.log(error)
    return res.status(401).json({ data: false, message: '您的登入階段已過期，請重新登入' });
  }
};

module.exports = authenticateAdmin;
