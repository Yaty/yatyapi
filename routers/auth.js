/*
Copyright (C) Hugo Da Roit <contact@hdaroit.fr> - All Rights Reserved
Unauthorized copying of this file, via any medium is strictly prohibited
Proprietary and confidential
Written by Hugo Da Roit <contact@hdaroit.fr>, 2017
Based on Vue-admin from Fangdun Cai <cfddream@gmail.com>
*/

const router =require('express').Router();
const mongodb = require('../modules/mongodb').users;
const authMiddlewares = require('../modules/middlewares').auth;
const JWTCheck = authMiddlewares.checkJWT;
const JWTSign = authMiddlewares.signJWT;
const CustomError = require('../modules/errors').CustomError;

router.post('/register', (req, res, next) => {
    mongodb.register(req.body.name, req.body.lastname, req.body.email, req.body.password)
        .then(() => res.sendStatus(201))
        .catch((e) => next(new CustomError(e, "POST /register failure :  " + JSON.stringify({ name: req.body.name, lastname: req.body.lastname, email: req.body.email }))));
});

router.post('/login', JWTSign, (req, res, next) => {
    mongodb.login(req.body.email, req.body.password)
        .then((user) => {
            if (user === null) throw new CustomError(CustomError.TYPES.AUTH_ERRORS.BAD_USER);
            else if (user.isMatch) return res.json({ token: res.locals.token });
            else throw new CustomError(CustomError.TYPES.AUTH_ERRORS.BAD_PASSWORD);
        })
        .catch((e) => next(new CustomError(e, "POST /login failure : " + req.body.email)));
});

router.post('/logout', JWTCheck, (req, res, next) => {
    mongodb.removeTokenFromUserByEmail(res.locals.email)
        .then(() => res.sendStatus(200))
        .catch((e) => next(new CustomError(e, "POST /logout failure : " + res.locals.email)));
});

router.get('/refresh', JWTCheck, (req, res, next) => {
    // TODO : create a new token and return it
    return res.sendStatus(200);
});

router.get('/user', JWTCheck, (req, res, next) => {
    mongodb.getUserInfoByEmail(res.locals.email)
        .then((user) => res.json({ data: user }))
        .catch((e) => next(new CustomError(e, "GET /user failure : " + res.locals.email)));
});

module.exports = router;