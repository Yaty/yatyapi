const jwt = require('jsonwebtoken');
const config = require('../../config');
const logger = require('../logger');
const mongodb = require('../mongodb').users;
const uuidv4 = require('uuid/v4');
const CustomError = require('../errors/').CustomError;

const checkJWT = (req, res, next) => {
    const getTokenFromHeaders = headers => {
        const authHeader = headers.authorization;
        if (authHeader) {
            const auth = authHeader.split(' ');
            if (auth && auth.length === 2) {
                if (auth[0] === 'Bearer') return auth[1];
                else throw new CustomError(CustomError.TYPES.JWT_ERRORS.BAD_AUTHORIZATION_TYPE, authHeader);
            } else throw new CustomError(CustomError.TYPES.JWT_ERRORS.UNKNOWN_AUTHORIZATION, authHeader);
        } else throw new CustomError(CustomError.TYPES.JWT_ERRORS.UNDEFINED_AUTHORIZATION, authHeader);
    };

    try {
        const token = getTokenFromHeaders(req.headers);

        jwt.verify(token, config.token.secret,
            {
                audience: config.token.options.audience,
                issuer: config.token.options.issuer,
            },
            (e, decodedToken) => {
                if (e) {
                    if (e.name === 'TokenExpiredError') throw new CustomError(CustomError.TYPES.JWT_ERRORS.TOKEN_EXPIRED, decodedToken, e);
                    else if (e.name === 'JsonWebTokenError') throw new CustomError(CustomError.TYPES.JWT_ERRORS.BAD_JWT, decodedToken, e);
                    throw new CustomError(CustomError.TYPES.JWT_ERRORS.VERIFICATION_ERROR, token, e);
                }

                // MongoDB check : useless ?
                mongodb.isUserExistById(decodedToken.userId)
                    .then((user) => {
                        if (user.tokenId !== decodedToken.jti) return Promise.reject(new CustomError(CustomError.TYPES.JWT_ERRORS.BAD_JWT, "Bad token id", e));
                        logger.debug("Access granted to " + decodedToken.email + " for " + req.originalUrl);
                        res.locals.email = decodedToken.email;
                        return next();
                    })
                    .catch(e => {
                        throw new CustomError(e, "checkJWT, isUserExistById");
                    });
            });
    } catch (e) {
        logger.error("Error when checking JWT", { error: e });
        return res.sendStatus(new CustomError(e).type.code);
    }
};

const signJWT = (req, res, next) => {
    const jwtId = uuidv4();
    jwt.sign(
        { email: req.body.email },
        config.token.secret,
        {
            expiresIn: config.token.options.expiresIn,
            audience: config.token.options.audience,
            issuer: config.token.options.issuer,
            jwtid: jwtId
        },
        (e, token) => {
            if (e) return next(new CustomError(CustomError.TYPES.JWT_ERRORS.SIGN_ERROR, token, e));
            mongodb.setUserTokenId(req.body.email, jwtId)
                .then(() => {
                    res.locals.token = token;
                    return next();
                })
                .catch((e) => {
                    return next(new CustomError(e, "signJwt, setUserTokenId"));
                });
        }
    );
};

module.exports = { checkJWT, signJWT };