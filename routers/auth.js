const express = require('express');
const router = express.Router();
const mongodb = require('../modules/mongodb');
const logger = require('../modules/logger');
const jwt = require('jsonwebtoken');
const config = require('../config');

router.post('/login', (req, res, next) => {
   mongodb.login(req.body.email, req.body.password)
       .then((isLoginSuccessful) => {
            if (isLoginSuccessful) {
                logger.debug('Login successful', { email: req.body.email, password: req.body.password });
                const token = jwt.sign({ email: req.body.email, password: req.body.password }, config.secret);
                return res.status(200).json({
                    token
                });
            } else {
                logger.debug('Login unsuccessful', { email: req.body.email, password: req.body.password });
                return res.status(401).send();
            }
       })
       .catch((e) => {
            logger.info('Error while login', { email: req.body.email, password: req.body.password, error: e });
            return next(e);
       });
});

router.post('/register', (req, res, next) => {
    jwt.sign({ email: req.body.email, password: req.body.password }, config.secret, (e, token) => {
        if (e) {
            logger.error('Error when creating a JWT token', { name: req.body.name, email: req.body.email, password: req.body.password, token, error: e })
            return next(e);
        }

        mongodb.register(req.body.email, req.body.password, token)
            .then(() => {
                logger.debug('Registration successful', { name: req.body.name, email: req.body.email, password: req.body.password, token });
                return res.status(201).json({
                    token
                });
            })
            .catch((e) => {
                logger.info('Registration unsuccessful', { name: req.body.name, email: req.body.email, password: req.body.password, token, error: e });
                return next(e);
            });
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