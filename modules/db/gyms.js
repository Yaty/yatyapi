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
        db.query('SELECT id, name FROM gyms')
            .then(resolve)
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
       db.query('SELECT ' +
           'COUNT(*) AS counter ' +
           'FROM gyms_users ' +
           'WHERE gym_id=? AND user_email=? ',
           [gym, user]
       )
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
       db.query('SELECT ' +
           'users.email, ' +
           'users.name, ' +
           'users.lastname, ' +
           'users.lastLogin ' +
           'FROM users JOIN gyms_users ON ( users.email = gyms_users.user_email ) ' +
           'WHERE gyms_users.gym_id = ?',
           [gym]
       )
       .then(resolve)
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

const getGymSubscriptions = (gym) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT ' +
            'subscriptions.label, ' +
            'subscriptions.description, ' +
            'subscriptions.duration_in_days, ' +
            'subscriptions.id ' +
            'FROM gyms_subscriptions JOIN subscriptions ON ( gyms_subscriptions.subscription_id = subscriptions.id) ' +
            'WHERE gyms_subscriptions.gym_id = ?',
            [gym]
        )
        .then(resolve)
        .catch(e => reject(new CustomError(e, "getGymSubscriptions")));
    });
};

/**
 * Return a object like this :
 * {
 *  gym: {
 *      Here there is gym info (name, address ...)
 *   }
 *  staff: {
 *      [] : array of people
 *  }
 * }
 * @param gym
 * @returns {Promise}
 */
const getGymInfo = (gym) => {
    return new Promise((resolve, reject) => {
        // TODO : Return only the displayed fields
        const gymInfoQuery = {
            query: 'SELECT gyms.logo, gyms.id, gyms.name, gyms.street_number, gyms.street_name, gyms.postal_code, gyms.city, gyms.country, gyms.phone_number1, gyms.phone_number2, gyms.description, gyms.email ' +
            'FROM gyms WHERE id = ?',
            params: [gym]
        };

        const gymStaffQuery = {
            query: 'SELECT users.email, users.name, users.lastname, gyms_users.role FROM users ' +
            'JOIN gyms_users ON ( users.email = gyms_users.user_email ) ' +
            'WHERE gyms_users.role IN (\'routesetters\', \'owner\') AND gyms_users.gym_id = ?',
            params: [gym]
        };

        db.queries([gymInfoQuery, gymStaffQuery])
            .then(res => resolve({ gym: res[0][0], staff: res[1], logo: !!res[0][0].logo }))
            .catch(e => reject(new CustomError(e, "getGymInfo")));
    });
};

const updateGym = (gym, staff) => {
    return new Promise((resolve, reject) => {
        const isGymValid = gym.hasOwnProperty('name') && gym.hasOwnProperty('description') && gym.hasOwnProperty('email') && gym.hasOwnProperty('phone_number1') && gym.hasOwnProperty('phone_number2') && gym.hasOwnProperty('street_number') && gym.hasOwnProperty('street_name') && gym.hasOwnProperty('postal_code') && gym.hasOwnProperty('city') && gym.hasOwnProperty('country') && gym.hasOwnProperty('id') && gym.id;
        if (!isGymValid) return reject(new CustomError(CustomError.TYPES.OTHERS.INVALID_GYM, "updateGym"));

        const gymUpdateQuery = {
            query: 'UPDATE gyms ' +
            'SET name = ?, description = ?, email = ?, phone_number1 = ?, phone_number2 = ?, street_number = ?, street_name = ?, postal_code = ?, city = ?, country = ? ' +
            'WHERE id = ?',
            params: [gym.name, gym.description, gym.email, gym.phone_number1, gym.phone_number2, gym.street_number, gym.street_name, gym.postal_code, gym.city, gym.country, gym.id]
        };

        const gymStaffUpdateQueries = [];

        for (let i = 0 ; i < staff.length ; i++) {
            if (staff[i].hasOwnProperty('email') && staff[i].hasOwnProperty('role')) {
                let user = staff[i].email;
                let userRole = staff[i].role;
                if (user && userRole) {
                    gymStaffUpdateQueries.push({
                        query: 'UPDATE gyms_users ' +
                        'SET role = ? ' +
                        'WHERE gym_id = ? AND user_email = ?',
                        params: [userRole, gym.id, user]
                    });
                }
            }
        }

        db.queries([gymUpdateQuery, ...gymStaffUpdateQueries])
            .then(resolve)
            .catch(e => reject(new CustomError(e, "updateGym")));
    });
};

const getGymLogo = (gym) => {
    return new Promise((resolve, reject) => {
       db.query('SELECT logo FROM gyms WHERE id = ?', [gym])
           .then(res => resolve(res[0].logo.toString('utf-8')))
           .catch(e => reject(new CustomError(e, "getGymLogo")));
    });
};

const setGymLogo = (gym, logo) => {
    return new Promise((resolve, reject) => {
        db.query('UPDATE gyms SET logo = ? WHERE id = ?', [logo, gym])
            .then(resolve)
            .then(e => reject(new CustomError(e, "setGymLogo")));
    });
};

module.exports = {
    getGyms,
    checkGymOwner,
    getGymMembers,
    addMembers,
    getGymSubscriptions,
    getGymInfo,
    updateGym,
    getGymLogo,
    setGymLogo
};