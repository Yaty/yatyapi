/*
Copyright (C) Hugo Da Roit <contact@hdaroit.fr> - All Rights Reserved
Unauthorized copying of this file, via any medium is strictly prohibited
Proprietary and confidential
Written by Hugo Da Roit <contact@hdaroit.fr>, 2017
Based on Vue-admin from Fangdun Cai <cfddream@gmail.com>
*/

const CustomError = require('../errors').CustomError;
const NodeCache = require( "node-cache" );
const cache = new NodeCache();
const db = require('./queriesHandler');
const logger = require('../logger')

const getGyms = () => {
    return new Promise((resolve ,reject) => {
        // TODO : caching with NodeCache, reset cache when new entry or deletion !!!
        db.query('SELECT * FROM gyms')
            .then(res => resolve(res))
            .catch(e => reject(new CustomError(e, "getGyms")));
        /*
        cache.get('gyms', (err, gyms1) => {
            if (err) return reject(new CustomError(CustomError.TYPES.CACHE_ERRORS.GET_ERROR, "getGyms", err));
            if (gyms1) return resolve(gyms1);
            else {
                User.distinct('gyms.name', (err, gyms2) => {
                    if (err) return reject(new CustomError(CustomError.TYPES.MONGODB_ERRORS.GET_GYMS_ERROR, '', err));
                    else {
                        cache.set('gyms', gyms2, (err, success) => {
                            if (!err && success) return resolve(gyms2);
                            else if (!err && !success) return reject(new CustomError(CustomError.TYPES.CACHE_ERRORS.SET_UNKNOWN_ERROR, "getGyms"));
                            else if (err && !success) return reject(new CustomError(CustomError.TYPES.CACHE_ERRORS.SET_ERROR), "getGyms", err);
                            else if (err && success) return reject(new CustomError(CustomError.TYPES.CACHE_ERRORS.SET_ERROR2, "getGyms", err));
                            else return reject(new CustomError(CustomError.TYPES.OTHERS.ERROR, "WTF getGyms : " + JSON.stringify(err) + ' ' + JSON.stringify(success)));
                        });
                    }
                });
            }
        });
        */
    });
};

const checkGymOwner = (gym, user) => {
    return new Promise((resolve, reject) => {
       db.query('SELECT COUNT(*) AS counter FROM gyms_users WHERE gym_id=? AND user_email=?', [gym, user])
           .then(res => {
               const counter = Number(res[0].counter);
               if (counter === 1) {
                   return resolve();
               } else if (counter > 1) {
                   logger.warn('A user got multiples times a gym', { user, gym});
                   return resolve();
               } else {
                   return reject(new CustomError(CustomError.TYPES.OTHERS.BAD_GYM_OWNER, "checkGymOwner"));
               }
           })
           .catch(e => reject(new CustomError(e, "checkGymOwner")));
    });
};

const getGymMembers = (gym) => {
    return new Promise((resolve, reject) => {
       db.query('SELECT users.email, users.name, users.lastname, users.lastLogin FROM users JOIN gyms_users ON ( users.email = gyms_users.user_email ) WHERE gyms_users.gym_id = ?', [gym])
           .then(res => resolve(res))
           .catch(e => reject(new CustomError(e, "getGymMembers")));
    });
};

module.exports = {
    getGyms,
    checkGymOwner,
    getGymMembers
};