const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
    const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided or malformed token' });
  }

  const token = authHeader.replace('Bearer ', '');

    if(!token) return res.status(401).send({message: 'Please authenticate.'});

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log(decoded);
        
        const user = await User.findById(decoded.userId);
       
        
        if(!user) throw new Error();
       
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({message:'Unauthorized!', error: error.message});
    }
};

const authorizeRoles = (...roles) => {
return (req, res, next) => {
    if(!req.user || !roles.includes(req.user.role)){
        return res.status(401).json({message: 'Forbidden: insufficient permissions.'});
    }
    next();
}

}

module.exports = {auth, authorizeRoles};