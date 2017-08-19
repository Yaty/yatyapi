/*
Copyright (C) Hugo Da Roit <contact@hdaroit.fr> - All Rights Reserved
Unauthorized copying of this file, via any medium is strictly prohibited
Proprietary and confidential
Written by Hugo Da Roit <contact@hdaroit.fr>, 2017
Based on Vue-admin from Fangdun Cai <cfddream@gmail.com>
*/

const jwt = require('jsonwebtoken');
const config = require('../../config');
const logger = require('../logger');
const CustomError = require('../errors/').CustomError;

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