import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  // 1. Get the token from the request header
  const authHeader = req.header('Authorization');

  // 2. Check if the token exists
  if (!authHeader) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // 3. Check if the token format is correct ("Bearer <token>")
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token format is invalid' });
    }

    // 4. Verify the token
    // This decodes the token using your secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Add the user's ID (from the token) to the request object
    // Now, all our protected routes will know *who* the user is
    req.user = decoded.user;
    
    // 6. Pass control to the next function (the actual route)
    next();

  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export default auth;