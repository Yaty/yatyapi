/*
Copyright (C) Hugo Da Roit <contact@hdaroit.fr> - All Rights Reserved
Unauthorized copying of this file, via any medium is strictly prohibited
Proprietary and confidential
Written by Hugo Da Roit <contact@hdaroit.fr>, 2017
Based on Vue-admin from Fangdun Cai <cfddream@gmail.com>
*/

const config = require('../../config');
const logger = require('../logger');
const User = require('./mongo-models').user;
const CustomError = require('../errors').CustomError;

const getUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        User.findOne({ email }, (err, user) => {
            if (err) return reject(new CustomError(CustomError.TYPES.MONGODB_ERRORS.UNKNOWN_USER, email));
            if (user === null || typeof user === 'undefined') return reject(new CustomError(CustomError.TYPES.MONGODB_ERRORS.UNKNOWN_USER, email));
            return resolve(user);
        });
    });
};

const login = (email, password) => {
    return new Promise((resolve, reject) => {
        getUserByEmail(email)
            .then(user => {
                user.comparePassword(password, (err, isMatch) => {
                    if (err) return reject(new CustomError(err, email));
                    return resolve({ isMatch, id: user.id, gyms: user.gyms });
                });
            })
            .catch(e => {
                return reject(new CustomError(e, "Error while login."));
            });
    });
};

const register = (name, lastname, email, password) => {
    return new Promise((resolve, reject) => {
        const newUser = new User({ name, lastname, email, password, lastLogin: new Date() });
        newUser.save((e) => {
            if (e) return reject(new CustomError(CustomError.TYPES.MONGODB_ERRORS.SAVE_ERROR, "Registration", e));
            return resolve();
        });
    });
};

const update = (name, lastname, email, oldPassword, newPassword, phone, address) => {
    return new Promise((resolve, reject) => {
        getUserByEmail(email)
            .then(user => {
                user.comparePassword(oldPassword, (err, isMatch) => {
                    if (err) return reject(new CustomError(CustomError.TYPES.JWT_ERRORS.COMPARE_PASSWORDS_ERROR, email, err));
                    if (isMatch) {
                        user.name = name;
                        user.lastname = lastname;
                        user.password = newPassword;
                        user.phone = phone;
                        user.address = address;
                        user.save((err) => {
                            if (err) {
                                if (err.name === 'ValidationError') return reject(new CustomError(CustomError.TYPES.MONGODB_ERRORS.VALIDATION_ERROR, user, err));
                                return reject(new CustomError(CustomError.TYPES.MONGODB_ERRORS.SAVE_ERROR, "Updating : " + user, err));
                            } else {
                                logger.debug('User updated', { email, name, lastname, phone, address });
                                return resolve();
                            }
                        });
                    } else return reject(new CustomError(CustomError.TYPES.AUTH_ERRORS.BAD_PASSWORD, email));
                });
            })
            .catch(e => {
                return reject(new CustomError(e, "Error while updating : " + email));
            });
    });
};

const setUserTokenId = (email, tokenId) => {
    return new Promise((resolve, reject) => {
        getUserByEmail(email)
            .then(user => {
                user.tokenId = tokenId;
                user.save((err) => {
                    if (err) return reject(new CustomError(CustomError.TYPES.MONGODB_ERRORS.SAVE_ERROR, "Token ID saving failed", err));
                    return resolve();
                });
            })
            .catch(e => {
                return reject(new CustomError(e, "Error while setting user token id : " + email + ' / ' + tokenId));
            });
    });
};

const getUserInfoByEmail = (email) => {
    return new Promise((resolve, reject) => {
        getUserByEmail(email)
            .then(user => {
                return resolve({
                    email: user.email,
                    name: user.name,
                    lastname: user.lastname,
                    gyms: user.gyms,
                    phone: user.phone,
                    address: user.address,
                    lastLogin: user.lastLogin
                });
            })
            .catch(e => {
                return reject(new CustomError(e, "Error while getting user info by email : " + email));
            });
    });
};

const isUserExistById = (id) => {
    return new Promise((resolve, reject) => {
        User.findOne({ id }, (err, user) => {
            if (err) return reject(new CustomError(CustomError.TYPES.MONGODB_ERRORS.UNKNOWN_USER, id));
            if (user === null || typeof user === 'undefined') return reject(new CustomError(CustomError.TYPES.MONGODB_ERRORS.UNKNOWN_USER, id));
            return resolve(user);
        });
    });
};

const removeTokenFromUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        getUserByEmail(email)
            .then(user => {
                user.tokenId = null;
                user.save((err) => {
                    if (err) return reject(new CustomError(CustomError.TYPES.MONGODB_ERRORS.SAVE_ERROR, "Updating : " + user, err));
                    return resolve();
                });
            })
            .catch(e => {
                return reject(new CustomError(e, "Error while removing token from user : " + email));
            });
    });
};

module.exports = {
    login,
    register,
    isUserExistById,
    setUserTokenId,
    getUserInfoByEmail,
    removeTokenFromUserByEmail
};
