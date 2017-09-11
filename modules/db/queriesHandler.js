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

const pool = require('mysql').createPool(require('../../config').pool);
const CustomError = require('../errors').CustomError;

const getConnection = () => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err && connection) connection.release();
            if (err) return reject(new CustomError(CustomError.TYPES.MYSQL_ERRORS.GET_CONNECTION_ERROR, "getConnection", err));
            return resolve(connection);
        });
    });
};

const query = (query, params) => {
    return new Promise((resolve, reject) => {
        getConnection()
            .then(connection => {
                connection.query(query, params, (err, res, fields) => {
                    if (err) reject(new CustomError(CustomError.TYPES.MYSQL_ERRORS.QUERY_ERROR, "query", err + ' - ' + err.sql));
                    else resolve(res);
                    connection.release();
                });
            })
            .catch(e => reject(new CustomError(e, "queriesHandler execQuery")))
    });
};

const queries = (queries) => {
    return new Promise((resolve, reject) => {
        const pQueries = [];
        queries.forEach(q => pQueries.push(query(q.query, q.params)));
        Promise.all(pQueries)
            .then((res) => resolve(res))
            .catch(e => reject(new CustomError(e, "queriesHandler queries")));
    });
};

module.exports = {
    query,
    queries
};