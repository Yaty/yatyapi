/*
Copyright (C) Hugo Da Roit <contact@hdaroit.fr> - All Rights Reserved
Unauthorized copying of this file, via any medium is strictly prohibited
Proprietary and confidential
Written by Hugo Da Roit <contact@hdaroit.fr>, 2017
Based on Vue-admin from Fangdun Cai <cfddream@gmail.com>
*/

const router = require('express').Router();
const db = require('../modules/db').gyms;
const JWTCheck = require('../modules/middlewares').auth.checkJWT;
const CustomError = require('../modules/errors').CustomError;

router.get('/', JWTCheck, (req, res, next) => {
    db.getGyms()
        .then((gyms) => {
            return res.json({ gyms });
        })
        .catch((e) => {
            return next(new CustomError(e, "GET /gyms fail"));
        });
});

router.get('/members', JWTCheck, (req, res, next) => {
    // Check if he owns the gym then return users
    const owner = req.query.email;
    const gym = req.query.gym;

    db.checkGymOwner(gym, owner)
        .then(() => db.getGymMembers(gym))
        .then(members => res.json({ members }))
        .catch(e => next(new CustomError(e, "GET /gyms/users fail")));
});

module.exports = router;