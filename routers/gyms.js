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
        .then(gyms => res.json({ gyms }))
        .catch((e) => next(new CustomError(e, "GET /gyms fail")));
});

router.get('/members', JWTCheck, (req, res, next) => {
    const owner = res.locals.email;
    const gym = req.query.gym;

    req.checkQuery('gym').isInt();

    req.getValidationResult()
        .then(result => {
            if (!result.isEmpty()) throw new CustomError(CustomError.TYPES.OTHERS.VALIDATION_ERROR, `Validation error ${JSON.stringify(result.array())}`);
            else return db.checkGymOwner(gym, owner);
        })
        .then(() => db.getGymMembers(gym))
        .then(members => res.json({ members }))
        .catch(e => next(new CustomError(e, "GET /gyms/members fail")));
});

router.post('/members/add', JWTCheck, (req, res, next) => {
    const members = req.body.members;
    const gym = req.body.gym;
    const owner = res.locals.email;

    req.checkBody('members').isArray().notEmpty();
    req.checkBody('gym').isInt();

    req.getValidationResult()
        .then(result => {
            if (!result.isEmpty()) throw new CustomError(CustomError.TYPES.OTHERS.VALIDATION_ERROR, `Validation error ${JSON.stringify(result.array())}`);
            else return db.checkGymOwner(gym, owner);
        })
        .then(() => db.addMembers(gym, members))
        .then(membersStatus => res.json({ members: membersStatus }))
        .catch(e => next(new CustomError(e, "POST /gyms/members/add fail")))
});

router.get('/subscriptions', JWTCheck, (req, res, next) => {
    const gym = req.query.gym;

    req.checkQuery('gym').isInt();

    req.getValidationResult()
        .then(result => {
            if (!result.isEmpty()) throw new CustomError(CustomError.TYPES.OTHERS.VALIDATION_ERROR, `Validation error ${JSON.stringify(result.array())}`);
            else return db.getGymSubscriptions(gym);
        })
        .then(subscriptions => res.json({ subscriptions }))
        .catch(e => next(new CustomError(e, "GET /gyms/subscriptions fail")));
});

router.put('/update', JWTCheck, (req, res, next) => {
    const owner = res.locals.email;
    const gym = req.body.gym;
    const staff = req.body.staff;

    req.checkBody('gym').isObject();
    req.checkBody('gym.id').isInt();
    req.checkBody('staff').isArray();

    req.getValidationResult()
        .then(result => {
            if (!result.isEmpty()) throw new CustomError(CustomError.TYPES.OTHERS.VALIDATION_ERROR, `Validation error ${JSON.stringify(result.array())}`);
            else return db.checkGymOwner(gym.id, owner);
        })
        .then(() => db.updateGym(gym, staff))
        .then(() => res.sendStatus(200))
        .catch(e => next(new CustomError(e, "PUT /gyms/update fail")));
});

router.put('/update/logo', JWTCheck, (req, res, next) => {
    const owner = res.locals.email;
    const gym = req.body.gym;
    const logo = req.body.logo;

    req.checkBody('gym').isInt();
    req.checkBody('logo').isAscii();

    req.getValidationResult()
        .then(result => {
            if (!result.isEmpty()) throw new CustomError(CustomError.TYPES.OTHERS.VALIDATION_ERROR, `Validation error ${JSON.stringify(result.array())}`);
            else return db.checkGymOwner(gym, owner);
        })
        .then(() => db.setGymLogo(gym, logo))
        .then(() => res.sendStatus(200))
        .catch(e => next(new CustomError(e, "PUT /gyms/update/logo fail")));
});

router.get('/:gym/logo', JWTCheck, (req, res, next) => {
    const owner = res.locals.email;
    const gym = req.params.gym;

    req.checkParams('gym').isInt();

    req.getValidationResult()
        .then(result => {
            if (!result.isEmpty()) throw new CustomError(CustomError.TYPES.OTHERS.VALIDATION_ERROR, `Validation error ${JSON.stringify(result.array())}`);
            else return db.checkGymOwner(gym, owner);
        })
        .then(() => db.getGymLogo(gym))
        .then(logo => res.json(logo))
        .catch(e => next(new CustomError(e, "GET /:gym/logo fail " + gym)));
});

// Need to be last
router.get('/:gym', JWTCheck, (req, res, next) => {
    const owner = res.locals.email;
    const gym = req.params.gym;

    req.checkParams('gym').isInt();

    req.getValidationResult()
        .then(result => {
            if (!result.isEmpty()) throw new CustomError(CustomError.TYPES.OTHERS.VALIDATION_ERROR, `Validation error ${JSON.stringify(result.array())}`);
            else return db.checkGymOwner(gym, owner);
        })
        .then(() => db.getGymInfo(gym))
        .then(gymInfo => res.json(gymInfo))
        .catch(e => next(new CustomError(e, "GET /:gym fail " + gym)));
});

module.exports = router;