/*
Copyright (C) Hugo Da Roit <contact@hdaroit.fr> - All Rights Reserved
Unauthorized copying of this file, via any medium is strictly prohibited
Proprietary and confidential
Written by Hugo Da Roit <contact@hdaroit.fr>, 2017
Based on Vue-admin from Fangdun Cai <cfddream@gmail.com>
*/

const router = require('express').Router();
const db = require('../modules/db').users;
const JWTCheck = require('../modules/middlewares').auth.checkJWT;
const CustomError = require('../modules/errors').CustomError;

router.post('/gym', JWTCheck, (req, res, next) => {
    const gymId = req.body.gymId;
    const user = req.body.email;

    req.checkBody('email').isEmail();
    req.checkBody('gymId').isInt();

    req.getValidationResult()
        .then(result => {
            if (!result.isEmpty()) throw new CustomError(CustomError.TYPES.OTHERS.VALIDATION_ERROR, `Validation error ${JSON.stringify(result.array())}`);
            else return db.addGymToUser(gymId, user)
        })
        .then(() => db.getUserGyms(user))
        .then(gyms => res.json({ gyms }))
        .catch(e => next(new CustomError(e, "POST /users/gym")));
});

router.get('/roles', JWTCheck, (req, res, next) => {
   db.getRoles()
       .then(roles => res.json(roles))
       .catch(e => next(new CustomError(e, "GET /users/roles")));
});

module.exports = router;