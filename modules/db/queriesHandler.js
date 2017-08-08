/*
Copyright (C) Hugo Da Roit <contact@hdaroit.fr> - All Rights Reserved
Unauthorized copying of this file, via any medium is strictly prohibited
Proprietary and confidential
Written by Hugo Da Roit <contact@hdaroit.fr>, 2017
Based on Vue-admin from Fangdun Cai <cfddream@gmail.com>
*/

const pool = require('mysql').createPool(require('../../config').pool);
const CustomError = require('../errors').CustomError;

const getConnection = () => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err && connection) connection.release();
            if (err) return reject(new CustomError(CustomError.TYPES.MYSQL_ERRORS.GET_CONNECTION_ERROR, "queriesHandler getConnection", err));
            return resolve(connection);
        });
    });
};

const query = (query, params) => {
    return new Promise((resolve, reject) => {
        getConnection()
            .then(connection => {
                connection.query(query, params, (err, res, fields) => {
                    if (err) return reject(new CustomError(CustomError.TYPES.MYSQL_ERRORS.QUERY_ERROR, "getConnection", err));
                    connection.release();
                    return resolve(res);
                });
            })
            .catch(e => reject(new CustomError(e, "queriesHandler execQuery")))
    });
};

module.exports = { query };