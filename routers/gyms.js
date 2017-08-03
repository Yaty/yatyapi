/*
Copyright (C) Hugo Da Roit <contact@hdaroit.fr> - All Rights Reserved
Unauthorized copying of this file, via any medium is strictly prohibited
Proprietary and confidential
Written by Hugo Da Roit <contact@hdaroit.fr>, 2017
Based on Vue-admin from Fangdun Cai <cfddream@gmail.com>
*/

const router = require('express').Router();
const mongodb = require('../modules/mongodb').gyms;
const JWTCheck = require('../modules/middlewares').auth.checkJWT;
const CustomError = require('../modules/errors').CustomError;

router.get('/', JWTCheck, (req, res, next) => {
    mongodb.getGyms()
        .then((gyms) => {
            return res.json({ gyms });
        })
        .catch((e) => {
            return next(new CustomError(e, "GET /gyms fail"));
        });
});

module.exports = router;