/*
Yaty - Climbing Gym Management
Copyright (C) 2017 - Hugo Da Roit <contact@hdaroit.fr>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

const router = require('express').Router();
const db = require('../modules/db').users;
const authMiddlewares = require('../modules/middlewares').auth;
const JWTCheck = authMiddlewares.checkJWT;
const JWTSign = authMiddlewares.signJWT;
const CustomError = require('../modules/errors').CustomError;
const validator = require('validator');
const logger = require('../modules/logger');

router.post('/register', (req, res, next) => {
    req.checkBody('name').notEmpty().isAscii();
    req.checkBody('lastname').notEmpty().isAscii();
    req.checkBody('email').isEmail();
    req.checkBody('password').isAscii();

    req.getValidationResult()
        .then(result => {
            if (!result.isEmpty()) throw new CustomError(CustomError.TYPES.OTHERS.VALIDATION_ERROR, `Validation error ${JSON.stringify(result.array())}`);
            else return db.register(req.body.name, req.body.lastname, req.body.email, req.body.password)
        })
        .then(() => res.sendStatus(201))
        .catch(e => next(new CustomError(e, `POST /register failure :  ${req.body.name}, ${req.body.lastname}, ${req.body.email}`)));
});

router.post('/login', JWTSign, (req, res, next) => {
    req.checkBody('email').isEmail();
    req.checkBody('password').isAscii();

    req.getValidationResult()
        .then(result => {
            if (!result.isEmpty()) throw new CustomError(CustomError.TYPES.OTHERS.VALIDATION_ERROR, `Validation error ${JSON.stringify(result.array())}`);
            else return db.login(req.body.email, req.body.password)
        })
        .then(() => {
            res.set({
                'Access-Control-Expose-Headers': 'Authorization',
                'Authorization': 'Bearer ' + res.locals.token
            }).json();
        })
        .catch(e => next(new CustomError(e, `POST /login failure : ${req.body.email}`)));
});

router.get('/user', JWTCheck, (req, res, next) => {
    db.getUserInfo(res.locals.email)
        .then(user => res.json({ data: user }))
        .catch(e => next(new CustomError(e, `GET /user failure : ${res.locals.email}`)));
});

module.exports = router;