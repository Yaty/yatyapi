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