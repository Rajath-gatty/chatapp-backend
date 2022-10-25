const jwt = require('jsonwebtoken');

const isAuth = (req, res, next) => {
    const token = req.header('Authorization');
    if(!token) return res.status(401).json({msg: 'Access denied'});
    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        req.userId= user.id;
    } catch (error) {
        res.status(400).json({msg: 'Invalid token'});
    }
    next();
}

module.exports = isAuth;