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

const getGyms = () => {
    return new Promise((resolve ,reject) => {
        // TODO : caching with NodeCache, reset cache when new entry or deletion !!!
        db.query('SELECT * FROM gyms')
            .then(res => resolve(res))
            .catch(e => new CustomError(e, "getGyms"));
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

module.exports = {
    getGyms
};