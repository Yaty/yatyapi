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
                logger.error('Can\'t find a user by email', { email, password, err });
                return reject(500);
            }

            if (user === null || typeof user === 'undefined') {
                return resolve(null);
            }

            user.comparePassword(password, (err, isMatch) => {
                if (err) {
                    logger.error('Can\'t compare password', { email, password, isMatch, err });
                    return reject(500);
                }
                return resolve({ isMatch, id: user.id, gyms: user.gyms });
            });
        });
    });
};

const register = (name, lastname, email, password) => {
    return new Promise((resolve, reject) => {
       const newUser = new User({ name, lastname, email, password, lastLogin: new Date() });
       newUser.save((e) => {
           if (e) {
               logger.error('Can\'t register', { error: e });
               return reject(500);
           }
           return resolve();
       });
    });
};

const update = (name, lastname, email, oldPassword, newPassword, phone, address) => {
    return new Promise((resolve, reject) => {
        User.findOne({ email }, (err, user) => {
            if (err || user === null || typeof user === 'undefined') {
                logger.error('Can\'t find a user by email', { name, lastname, email, phone, address, err });
                return reject(404);
            }

            user.comparePassword(oldPassword, (err, isMatch) => {
                if (err) {
                    logger.error('Can\'t compare password', { name, lastname, email, phone, address, isMatch, err });
                    return reject(500);
                }
                if (isMatch) {
                    user.name = name;
                    user.lastname = lastname;
                    user.password = newPassword;
                    user.phone = phone;
                    user.address = address;
                    user.save((err) => {
                        if (err) {
                            if (err.name === 'ValidationError') {
                                logger.error('Bad input to update user', { name, lastname, email, phone, address, err});
                                return reject(400);
                            } else {
                                logger.error('Can\'t update user', { name, lastname, email, phone, address, err});
                                return reject(500);
                            }
                        } else {
                            logger.debug('User updated', { email, name, lastname, phone, address });
                            return resolve();
                        }
                    })
                } else {
                    return reject(401);
                }
            });
        });
    });
};

const isUserExistById = (id) => {
    return new Promise((resolve, reject) => {
        User.findOne({ id }, (err, user) => {
          if (err) {
              logger.error('Can\'t find user by id', { error: err });
              return reject(500);
          }
          return resolve();
        });
    });
};

const setUserTokenId = (email, tokenId) => {
    return new Promise((resolve, reject) => {
        User.findOne({ email }, (err, user) => {
            if (err) {
                logger.error('Can\'t find user by email', { error: err });
                return reject(500);
            }
            user.tokenId = tokenId;
            user.save((err) => {
               if (err) {
                   logger.error('Can\'t save token email', { error: err });
                   return reject(500);
               }
               return resolve();
            });
        });
    });
};

module.exports = { login, register, isUserExistById, setUserTokenId};
