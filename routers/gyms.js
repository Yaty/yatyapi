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
    const owner = res.locals.email;
    const gym = req.query.gym;

    db.checkGymOwner(gym, owner)
        .then(() => db.getGymMembers(gym))
        .then(members => res.json({ members }))
        .catch(e => next(new CustomError(e, "GET /gyms/members fail")));
});

router.post('/members/add', JWTCheck, (req, res, next) => {
    const members = req.body.members;
    const gym = req.body.gym;
    const owner = res.locals.email;

    db.checkGymOwner(gym, owner)
        .then(() => db.addMembers(gym, members))
        .then(membersStatus => res.json({ members: membersStatus }))
        .catch(e => next(new CustomError(e, "POST /gyms/members/add fail")))
});

router.get('/subscriptions', JWTCheck, (req, res, next) => {
    const gym = req.query.gym;
    const owner = res.locals.email;

    db.checkGymOwner(gym, owner)
        .then(() => db.getGymSubscriptions(gym))
        .then(subscriptions => res.json({ subscriptions }))
        .catch(e => next(new CustomError(e, "GET /gyms/subscriptions fail")));
});

module.exports = router;