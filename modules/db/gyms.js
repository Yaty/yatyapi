/*
Yaty - Climbing Gym Management
Copyright (C) 2017 - Hugo Da Roit <contact@hdaroit.fr>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

const CustomError = require('../errors').CustomError;
const NodeCache = require( "node-cache" );
const db = require('./queriesHandler');
const logger = require('../logger')

const getGyms = () => {
    return new Promise((resolve ,reject) => {
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
           'users.lastLogin, ' +
           'subscriptions.label as subscription ' +
           'FROM users ' +
           'JOIN gyms_users ON ( users.email = gyms_users.user_email ) ' +
           'JOIN users_subscriptions ON ( users.email = users_subscriptions.user_email ) ' +
           'JOIN subscriptions ON ( users_subscriptions.subscription_id = subscriptions.id ) ' +
           'WHERE gyms_users.gym_id = ?',
           [gym]
       )
       .then(resolve)
       .catch(e => reject(new CustomError(e, "getGymMembers")));
    });
};

// TODO : Send a mail to member.email with a validation code to able him to access his account
// TODO : Validation !
// TODO : Rewrite using nested array for queries
const addMembers = (gym, members) => {
    return new Promise((resolve, reject) => {
        const insertInUsersColumns = ['email', 'name', 'lastname'];
        const insertInUsers = {
            query: 'INSERT INTO users (' + insertInUsersColumns.toString() +  ') VALUES ',
            params: []
        };

        const insertInGymsUsersColumns = ['gym_id', 'user_email', 'role'];
        const insertInGymsUsers = {
            query: 'INSERT INTO gyms_users (' + insertInGymsUsersColumns.toString() + ') VALUES ',
            params: []
        };

        const insertInUsersSubscriptionsColumns = ['subscription_id', 'user_email', 'start_date', 'end_date'];
        const insertInUsersSubscriptions = {
            query: 'INSERT INTO users_subscriptions (' + insertInUsersSubscriptionsColumns.toString() + ') VALUES ',
            params: []
        };

        const toMySQLDate = (date) => date.toISOString().slice(0, 19).replace('T', ' '); // TODO : find a away to deal with the timezone of the user since we are removing him from there

        for (let i = 0; i < members.length; i++) {
            let member = members[i];
            if (member.hasOwnProperty('email') && member.hasOwnProperty('name') && member.hasOwnProperty('lastname') && member.hasOwnProperty('subscription') && member.subscription.hasOwnProperty('id') && member.subscription.hasOwnProperty('duration_in_days') && gym) {
                insertInUsers.query += i === members.length - 1 ? '(?, ?, ?)' : '(?, ?, ?), ';
                insertInUsers.params.push(member.email, member.name, member.lastname);

                insertInGymsUsers.query += i === members.length - 1 ? '(?, ?, ?)' : '(?, ?, ?), ';
                insertInGymsUsers.params.push(gym, member.email, member.role);

                let now = new Date();
                let endOfSubscription = new Date(new Date().setDate(now.getDate() + member.subscription.duration_in_days));
                insertInUsersSubscriptions.query += i === members.length - 1 ? '(?, ?, ?, ?)' : '(?, ?, ?, ?), ';
                insertInUsersSubscriptions.params.push(
                    member.subscription.id,
                    member.email,
                    toMySQLDate(now),
                    toMySQLDate(endOfSubscription)
                )
            } else {
                logger.info('A user will not be added (addMembers) :', { member, gym });
                member.created = false
            }
        }

        if (insertInUsers.params.length > 0 && insertInGymsUsers.params.length > 0 && insertInUsersSubscriptions.params.length > 0) {
            db.query(insertInUsers.query, insertInUsers.params)
                .then(res => {
                    const allMembersAddedInUsers = res.affectedRows === insertInUsers.params.length/insertInUsersColumns.length;
                    members.forEach(member => member.created = allMembersAddedInUsers);
                    return db.queries([insertInGymsUsers, insertInUsersSubscriptions])
                })
                .then(res => {
                    const allMembersAddedInGymsUsers = res[0].affectedRows === insertInGymsUsers.params.length/insertInGymsUsersColumns.length;
                    const allMembersAddedInUsersSubscriptions = res[1].affectedRows === insertInUsersSubscriptions.params.length/insertInUsersSubscriptionsColumns.length;
                    if (!allMembersAddedInGymsUsers || !allMembersAddedInUsersSubscriptions) logger.warn('Some users will not have a subscription or a gym', { res, gym, member });
                    return resolve(members);
                }).catch(e => reject(new CustomError(e, "addMembers")));
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
        const gymInfoQuery = {
            query: 'SELECT gyms.id, gyms.name, gyms.street_number, gyms.street_name, gyms.postal_code, gyms.city, gyms.country, gyms.phone_number1, gyms.phone_number2, gyms.description, gyms.email ' +
            'FROM gyms WHERE id = ?',
            params: [gym]
        };

        const gymStaffQuery = {
            query: 'SELECT users.email, users.name, users.lastname, gyms_users.role FROM users ' +
            'JOIN gyms_users ON ( users.email = gyms_users.user_email ) ' +
            'WHERE gyms_users.role IN (\'routesetters\', \'owner\') AND gyms_users.gym_id = ?',
            params: [gym]
        };

        const logoExists = {
            query: 'SELECT gyms.logo FROM gyms WHERE id = ?',
            params: [gym]
        };

        db.queries([gymInfoQuery, gymStaffQuery, logoExists])
            .then(res => resolve({ gym: res[0][0], staff: res[1], logo: !!res[2][0].logo }))
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

/**
 * Update a gym subscriptions by first adding the subscriptions in table if it doesn't exist
 * If it exist it just update it
 * By default every sub of a gym will be updated, mysql is not a dick and will not update thoses rows if they didn't changed
 * @param gym
 * @param subscriptions
 * @returns {Promise}
 */
const updateGymSubscriptions = (gym, subscriptions) => {
  return new Promise((resolve, reject) => {
      const createSubscriptions = {
          query: 'INSERT INTO subscriptions (label, description, duration_in_days) VALUES ?',
          params: [[]]
      };

      const updateSubscriptions = {
          query: 'INSERT INTO subscriptions (label, description, duration_in_days, id) VALUES ? ON DUPLICATE KEY UPDATE label = VALUES(label), description = VALUES(description), duration_in_days = VALUES(duration_in_days), id = VALUES(id)',
          params: [[]]
      };

      subscriptions.forEach(subscription => {
          if (subscription.hasOwnProperty('label') && subscription.hasOwnProperty('description') && subscription.hasOwnProperty('duration_in_days')) {
              if (subscription.hasOwnProperty('new') && subscription.new === true) {
                  // Create
                  createSubscriptions.params[0].push([subscription.label, subscription.description, subscription.duration_in_days]);
                  subscription.status = 'created';
              } else if (subscription.hasOwnProperty('id') && subscription.id) {
                  // Update
                  updateSubscriptions.params[0].push([subscription.label, subscription.description, subscription.duration_in_days, subscription.id]);
                  subscription.status = 'updated'
              } else {
                  logger.warn('Invalid subscription updateGymSubscriptions', { subscription, gym });
                  subscription.status = 'invalid_1';
              }
          } else {
              subscription.status = 'invalid_2';
          }
      });

      const queries = [];
      let creating;

      if (createSubscriptions.params[0].length > 0) {
          queries.push(createSubscriptions);
          creating = true;
      }

      if (updateSubscriptions.params[0].length > 0) queries.push(updateSubscriptions);

      if (queries.length === 0) return resolve(); // nothing to insert or update

      db.queries(queries)
          .then(res => {
              if (creating) { // If subscriptions have been added we have to link them with the gym
                  const insertIdFirst = res[0].insertId; // the query to insert new sub is always at index 0
                  const insertIdLast = insertIdFirst + (updateSubscriptions.params[0].length - 1);
                  const values = [];

                  for (let i = insertIdFirst; i <= insertIdLast; i++) {
                      values.push([gym, i]);
                  }
                  console.log('DONE1');
                  return db.query('INSERT INTO gyms_subscriptions (gym_id, subscription_id) VALUES ?', [values])
              } else { // Update or something else, we just resolve
                  resolve();
              }
          })
          .then(res => {
              resolve();
          })
          .catch(e => reject(new CustomError(e, "updateGymSubscriptions")));
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
    updateGymSubscriptions,
    getGymLogo,
    setGymLogo
};