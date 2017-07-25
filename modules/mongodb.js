const config = require('../config');
const logger = require('./logger');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const User = require('./mongo-models/user');

mongoose.connect(config.mongodb, { useMongoClient: true }, (e) => {
    if (e) {
        logger.error('Can\'t connect to MongoDB', { error: e });
        throw e;
    }
    logger.info('Successfully connected to MongoDB.');
});

const login = (email, password) => {
    return new Promise((resolve, reject) => {
        User.findOne({ email }, (err, user) => {
            if (err) {
                logger.error('Can\'t find a user by email', { error: err });
                return reject(err);
            }

            if (user === null || typeof user === 'undefined') {
                return resolve(false);
            }

            user.comparePassword(password, (err, isMatch) => {
                if (err) {
                    logger.error('Can\'t compare password', { error: err });
                    return reject(err);
                }
                return resolve(isMatch);
            });
        });
    });
};

const register = (email, password, jwt) => {
    return new Promise((resolve, reject) => {
       const newUser = new User({ email, password, jwt });
       newUser.save((e) => {
           if (e) return reject(e);
           return resolve();
       });
    });
};

module.exports = { login, register };
