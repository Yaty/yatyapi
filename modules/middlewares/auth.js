const jwt = require('jsonwebtoken');
const config = require('../../config');

const checkJWT = (req, res, next) => {
    const token = req.cookies.jwt;
    jwt.verify(token, config.secret, (e) => {
        if (e) return res.status(401).send();
        next();
    });
};

module.exports = { checkJWT };