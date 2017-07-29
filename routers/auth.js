const express = require('express');
const router = express.Router();
const mongodb = require('../modules/mongodb');
const logger = require('../modules/logger');
const config = require('../config');
const middlewares = require('../modules/middlewares');
const JWTCheck = middlewares.jwtCheck;
const JWTSign = middlewares.jwtSign;

router.post('/register', (req, res, next) => {
    mongodb.register(req.body.name, req.body.lastname, req.body.email, req.body.password)
        .then(() => {
            logger.debug('Registration successful', { name: req.body.name, lastname: req.body.lastname, email: req.body.email });
            return res.sendStatus(201);
        })
        .catch((e) => {
            logger.info('Registration unsuccessful', { name: req.body.name, lastname: req.body.lastname, email: req.body.email, error: e });
            return next(e);
        });
});

router.post('/login', JWTSign, (req, res, next) => {
    mongodb.login(req.body.email, req.body.password)
        .then((user) => {
            if (user === null) {
                logger.debug('Login unsuccessful', { email: req.body.email, pass: req.body.password });
                return res.sendStatus(401);
            } else if (user.isMatch) {
                const token = res.locals.token; // set by the auth middleware
                return res.json({ token, gyms: user.gyms });
            } else {
                throw "Unknown error while login.";
            }
        })
        .catch((e) => {
            logger.info('Error while login', { email: req.body.email, error: e });
            return next(e);
        });
});

router.get('/refresh', JWTCheck, (req, res, next) => {
    return res.status(200).json({
        status: 'success'
    });
});

router.get('/user', JWTCheck, (req, res, next) => {
    // TODO
    return res.status(200).json({
        status: 'success'
    });
});

/*
router.post('/jwt/verify', (req, res, next) => {
    const token = req.body.token;
    jwt.verify(token, config.secret, (err, decode) => {
       if (err) return next(err);
       return res.json({
          validity: typeof decode !== 'undefined'
       });
    });
});
*/

module.exports = router;