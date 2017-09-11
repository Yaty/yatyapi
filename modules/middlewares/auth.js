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

const jwt = require('jsonwebtoken');
const config = require('../../config');
const logger = require('../logger');
const CustomError = require('../errors/').CustomError;
const validator = require('validator');

const checkJWT = (req, res, next) => {
    const getTokenFromHeaders = headers => {
        const authHeader = headers.authorization;
        if (authHeader) {
            const auth = authHeader.split(' ');
            if (auth && auth.length === 2) {
                if (auth[0] === 'Bearer') return auth[1];
                else return next(new CustomError(CustomError.TYPES.JWT_ERRORS.BAD_AUTHORIZATION_TYPE, authHeader));
            } else return next(new CustomError(CustomError.TYPES.JWT_ERRORS.UNKNOWN_AUTHORIZATION, authHeader));
        } else return next(new CustomError(CustomError.TYPES.JWT_ERRORS.UNDEFINED_AUTHORIZATION, authHeader));
    };

    try {
        const token = getTokenFromHeaders(req.headers);
        // TODO : Use RSA encryption
        jwt.verify(token, config.token.secret,
            {
                audience: config.token.options.audience,
                issuer: config.token.options.issuer,
            },
            (e, decodedToken) => {
                if (e) {
                    if (e.name === 'TokenExpiredError') return next(new CustomError(CustomError.TYPES.JWT_ERRORS.TOKEN_EXPIRED, decodedToken, e));
                    else if (e.name === 'JsonWebTokenError') return next(new CustomError(CustomError.TYPES.JWT_ERRORS.BAD_JWT, decodedToken, e));
                    return next(new CustomError(CustomError.TYPES.JWT_ERRORS.VERIFICATION_ERROR, token, e));
                }

                logger.debug("Access granted to " + decodedToken.email + " for " + req.originalUrl);
                res.locals.email = decodedToken.email;

                if (!validator.isEmail(res.locals.email)) {
                    logger.warn('The email is wrong in the JWT Payload', { email: res.locals.email });
                    return next(new CustomError(CustomError.TYPES.JWT_ERRORS.VERIFICATION_ERROR, 'Bad email ' + res.locals.email));
                }

                return next();
            });
    } catch (e) {
        logger.error("Error when checking JWT", { error: e });
        return res.sendStatus(new CustomError(e).type.code);
    }
};

const signJWT = (req, res, next) => {
    jwt.sign(
        { email: req.body.email },
        config.token.secret,
        {
            expiresIn: config.token.options.expiresIn,
            audience: config.token.options.audience,
            issuer: config.token.options.issuer
        },
        (e, token) => {
            if (e) return next(new CustomError(CustomError.TYPES.JWT_ERRORS.SIGN_ERROR, token, e));
            res.locals.token = token;
            return next();
        }
    );
};

module.exports = { checkJWT, signJWT };