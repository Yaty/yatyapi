const jwt = require('jsonwebtoken');
const config = require('../../config');
const logger = require('../logger');
const mongodb = require('../mongodb');
const uuidv4 = require('uuid/v4');

const checkJWT = (req, res, next) => {
    const getTokenFromHeaders = headers => {
        const authHeader = headers.authorization;
        if (authHeader) {
            const auth = authHeader.split(' ');
            if (auth && auth.length === 2 && auth[0] === 'Bearer') {
                if (auth[0] === 'Bearer') return auth[1];
                else throw "The authorization header type is not Bearer";
            } else throw "Unknown authorization header";
        } else throw "Undefined authorization header";
    };

    try {
        const token = getTokenFromHeaders(req.headers);

        jwt.verify(token, config.token.secret,
            {
                audience: config.token.options.audience,
                issuer: config.token.options.issuer,
            },
            (e, decodedToken) => {
                if (e) throw "Error when verifying token : " + token + ' : ' + e;

                // MongoDB check : useless ?
                mongodb.isUserExistById(decodedToken.userId)
                    .then((user) => {
                        if (user.tokenId !== decodedToken.jti) return Promise.reject("Invalid token : " + tokenId + ' / ' + decodedToken.jwtid);
                        logger.debug("Access granted to " + decodedToken.email + " for " + req.originalUrl);
                        res.locals.email = decodedToken.email;
                        return next();
                    })
                    .catch(e => {
                        throw e;
                    });
            });
    } catch (e) {
        logger.error("Error when checking JWT", { error: e });
        return res.status(401).send();
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
            if (e) {
                logger.error('Error when creating a JWT token', { email: req.body.email, token, user, error: e });
                return next(e);
            }
            mongodb.setUserTokenId(req.body.email, jwtId)
                .then(() => {
                    res.locals.token = token;
                    return next();
                })
                .catch((e) => {
                    logger.error('Can\'t setUserToken', { error: e});
                    return next(e);
                });
        }
    );
};

module.exports = { checkJWT, signJWT };