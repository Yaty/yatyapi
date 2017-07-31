const express = require('express');
const router = express.Router();
const mongodb = require('../modules/mongodb').users;
const logger = require('../modules/logger');
const config = require('../config');
const authMiddlewares = require('../modules/middlewares').auth;
const JWTCheck = authMiddlewares.checkJWT;
const JWTSign = authMiddlewares.signJWT;

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
                logger.debug('Login unsuccessful', { email: req.body.email });
                return res.sendStatus(401);
            } else if (user.isMatch) {
                const token = res.locals.token; // set by the auth middleware
                return res.json({ token });
            } else {
                throw "Unknown error while login.";
            }
        })
        .catch((e) => {
            logger.info('Error while login', { email: req.body.email, error: e });
            return next(e);
        });
});

router.post('/logout', JWTCheck, (req, res, next) => {
    mongodb.removeTokenFromUserByEmail(res.locals.email)
        .then(() => {
            return res.sendStatus(200);
        })
        .catch((e) => {
            logger.info('Error while logout', { email: res.locals.email, error: e });
            return next(e);
        });
});

router.get('/refresh', JWTCheck, (req, res, next) => {
    // TODO : create a new token and return it
    return res.status(200).json({
        status: 'success'
    });
});

router.get('/user', JWTCheck, (req, res, next) => {
    // TODO
    mongodb.getUserInfoByEmail(res.locals.email)
        .then(user => {
            return res.json({
                data: user
            });
        })
        .catch(e => {
            logger.info('Error while getting user', { email: res.locals.email, error: e });
            return next(e);
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