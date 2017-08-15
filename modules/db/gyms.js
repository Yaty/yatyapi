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

// TODO : Send a mail to member.email with a validation code to able him to access his account
const addMembers = (gym, members) => {
    return new Promise((resolve, reject) => {
        const insertInUsersColumns = ['email', 'name', 'lastname'];
        const insertInUsers = {
            query: 'INSERT INTO users (' + insertInUsersColumns.toString() +  ') VALUES ',
            params: []
        };

        const insertInGymsUsersColumns = ['gym_id', 'user_email'];
        const insertInGymsUsers = {
            query: 'INSERT INTO gyms_users (' + insertInGymsUsersColumns.toString() + ') VALUES ',
            params: []
        };

        for (let i = 0; i < members.length; i++) {
            let member = members[i];
            if (member.hasOwnProperty('email') && member.hasOwnProperty('name') && member.hasOwnProperty('lastname') && gym) {
                insertInUsers.query += i === members.length - 1 ? '(?, ?, ?)' : '(?, ?, ?), ';
                insertInUsers.params.push(member.email, member.name, member.lastname);

                insertInGymsUsers.query += i === members.length - 1 ? '(?, ?)' : '(?, ?), ';
                insertInGymsUsers.params.push(gym, member.email);
            } else {
                logger.info('A user will not be added (addMembers) :', { member, gym });
                member.created = false
            }
        }

        if (insertInUsers.params.length > 0 && insertInGymsUsers.params.length > 0) {
            db.queries([insertInUsers, insertInGymsUsers])
                .then(res => {
                    if (Number(res[0].affectedRows) === insertInUsers.params.length/insertInUsersColumns.length && Number(res[1].affectedRows) === insertInGymsUsers.params.length/insertInGymsUsersColumns.length) {
                        // All members are created
                        members.forEach(member => {
                            if (!member.created) {
                                member.created = true
                            }
                        });
                    } else {
                        // Some members aren't created, we can't know which so we set that to null
                        members.forEach(member => {
                            if (member.created !== false) {
                                member.created = null
                            }
                        });
                    }
                    return resolve(members);
                })
                .catch(e => reject(new CustomError(e, "addMembers")));
        } else return reject(new CustomError(CustomError.TYPES.OTHERS.INVALID_USERS, "addMembers"));
    });
};

module.exports = {
    getGyms,
    checkGymOwner,
    getGymMembers,
    addMembers
};