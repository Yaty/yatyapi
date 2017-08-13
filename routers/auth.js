/*
Copyright (C) Hugo Da Roit <contact@hdaroit.fr> - All Rights Reserved
Unauthorized copying of this file, via any medium is strictly prohibited
Proprietary and confidential
Written by Hugo Da Roit <contact@hdaroit.fr>, 2017
Based on Vue-admin from Fangdun Cai <cfddream@gmail.com>
*/

const router = require('express').Router();
const db = require('../modules/db').users;
const authMiddlewares = require('../modules/middlewares').auth;
const JWTCheck = authMiddlewares.checkJWT;
const JWTSign = authMiddlewares.signJWT;
const CustomError = require('../modules/errors').CustomError;

router.post('/register', (req, res, next) => {
    db.register(req.body.name, req.body.lastname, req.body.email, req.body.password)
        .then(() => res.sendStatus(201))
        .catch(e => next(new CustomError(e, "POST /register failure :  " + JSON.stringify({ name: req.body.name, lastname: req.body.lastname, email: req.body.email }))));
});

router.post('/login', JWTSign, (req, res, next) => {
    db.login(req.body.email, req.body.password)
        .then(() => {
            res.set({
                'Access-Control-Expose-Headers': 'Authorization',
                'Authorization': 'Bearer ' + res.locals.token
            }).json();
        })
        .catch(e => next(new CustomError(e, "POST /login failure : " + req.body.email)));
});

router.get('/user', JWTCheck, (req, res, next) => {
    db.getUserInfo(res.locals.email)
        .then(user => res.json({ data: user }))
        .catch(e => next(new CustomError(e, "GET /user failure : " + res.locals.email)));
});

module.exports = router;