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

router.put('/subscriptions', JWTCheck, (req, res, next) => {
    const gym = req.body.gym;
    const subscriptions = req.body.subscriptions;
    const owner = res.locals.email;

    req.checkBody('gym').isInt();
    req.checkBody('subscriptions').isArray();

    // TODO subscriptions validations : https://github.com/ctavan/express-validator/issues/125#issuecomment-91363539

    req.getValidationResult()
        .then(result => {
            if (!result.isEmpty()) throw new CustomError(CustomError.TYPES.OTHERS.VALIDATION_ERROR, `Validation error ${JSON.stringify(result.array())}`);
            else return db.checkGymOwner(gym, owner);
        })
        .then(() => db.updateGymSubscriptions(gym, subscriptions))
        .then(() => res.sendStatus(200))
        .catch(e => next(new CustomError(e, "PUT /gyms/update fail")));
});

router.put('/update', JWTCheck, (req, res, next) => {
    const owner = res.locals.email;
    const gym = req.body.gym;
    const staff = req.body.staff;

    req.checkBody('gym').isObject();
    req.checkBody('gym.id').isInt();
    req.checkBody('staff').isArray();

    // TODO, staff and gym validation

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