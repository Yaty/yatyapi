/*
Copyright (C) Hugo Da Roit <contact@hdaroit.fr> - All Rights Reserved
Unauthorized copying of this file, via any medium is strictly prohibited
Proprietary and confidential
Written by Hugo Da Roit <contact@hdaroit.fr>, 2017
Based on Vue-admin from Fangdun Cai <cfddream@gmail.com>
*/

const config = require('../../config');
const logger = require('../logger');
const CustomError = require('../errors').CustomError;
const db = require('./queriesHandler');
const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;

const getUser = (email) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM users WHERE email=?', [email])
            .then(res => {
                if (res.length === 0) return reject(new CustomError(CustomError.TYPES.MYSQL_ERRORS.UNKNOWN_USER, email));
                if (res.length === 1) return resolve(res[0]);
                return reject(new CustomError(CustomError.TYPES.MYSQL_ERRORS.UNKNOWN_USER));
            })
            .catch(e => reject(new CustomError(e, "getUser", e)));
    });
};

const getUserGyms = (email) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM gyms_users WHERE user_email=?', [email])
            .then(gyms => resolve(gyms))
            .catch(e => reject(new CustomError(e, "getUserGyms", e)));
    });
};

const comparePassword = (candidatePassword, password) => {
    return new Promise((resolve, reject) => {
        bcrypt.compare(candidatePassword, password)
            .then(isMatch => resolve(isMatch))
            .catch(e => reject(new CustomError(CustomError.TYPES.BCRYPT_ERRORS.COMPARE_PASSWORDS_ERROR, "comparePassword", e)));
    });
};

const login = (email, password) => {
    return new Promise((resolve, reject) => {
        getUser(email)
            .then(user => comparePassword(password, user.password))
            .then(isMatch => isMatch ? resolve() : reject(new CustomError(CustomError.TYPES.AUTH_ERRORS.BAD_PASSWORD, "login")))
            .catch(e => reject(new CustomError(e, "login")));
    });
};

const register = (name, lastname, email, password) => {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, SALT_WORK_FACTOR)
            .then(hash => db.query('INSERT INTO users (email, name, lastname, password) VALUES (?, ?, ?, ?)', [email, name, lastname, hash]))
            .then(res => resolve())
            .catch(e => reject(new CustomError(e, "register", e)));
    });
};

/*
const update = (connection, name, lastname, email, oldPassword, newPassword, phone, address) => {
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
*/

const setUserTokenId = (email, tokenId) => {
    return new Promise((resolve, reject) => {
        db.query('UPDATE users SET tokenId=? WHERE email=?', [tokenId, email])
            .then(res => resolve())
            .catch(e => reject(new CustomError(e, "setUserTokenId : " + email + ' / ' + tokenId)));
    });
};

const getUserInfo = (email) => {
    return new Promise((resolve, reject) => {
        const userInfo = {};
        getUser(email)
            .then(user => {
                userInfo.email = user.email;
                userInfo.name = user.name;
                userInfo.lastname = user.lastname;
                userInfo.lastLogin = user.lastLogin;
                return getUserGyms(email);
            })
            .then(gyms => {
                userInfo.gyms = gyms;
                return resolve(userInfo);
            })
            .catch(e => reject(new CustomError(e, "getUserInfo : " + email)));
    });
};

module.exports = {
    login,
    register,
    setUserTokenId,
    getUserInfo
};
