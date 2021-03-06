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

const errors = {
    JWT_ERRORS: {
        BAD_AUTHORIZATION_TYPE: { name: "BAD_AUTHORIZATION_TYPE", msg: "Occur when the Authorization type is not Bearer.", code: 400 },
        UNKNOWN_AUTHORIZATION: { name: "UNKNOWN_AUTHORIZATION", msg: "Occur when an the authorization header is invalid.", code: 400 },
        UNDEFINED_AUTHORIZATION: { name: "UNDEFINED_AUTHORIZATION", msg: "Occur when the authorization header is undefined.", code: 400 },
        TOKEN_EXPIRED: { name: "TOKEN_EXPIRED", msg: "Occur when the token is expired.", code: 419 },
        BAD_JWT: { name: "BAD_JWT", msg: "Occur when the JWT verification detect a bad JWT.", code: 401 },
        VERIFICATION_ERROR : { name: "VERIFICATION_ERROR", msg: "Occur when jwt.verify fail.", code: 500 },
        SIGN_ERROR: { name: "SIGN_ERROR", msg: "Occur when jwt.sign fail.", code: 500 },
    },
    AUTH_ERRORS: {
        BAD_PASSWORD: { name: "BAD_PASSWORD", msg: "Occur when a password is wrong.", code: 401},
    },
    MYSQL_ERRORS: {
        GET_CONNECTION_ERROR: { name: "GET_CONNECTION_ERROR", msg:"Occur when a pool can't retrieve a connection.", code: 500 },
        QUERY_ERROR: { name: "QUERY_ERROR", msg: "Occur when a query fail.", code: 500 },
        SEARCH_USER_ERROR: { name: "SEARCH_USER_ERROR", msg: "Occur when a user search fail.", code: 500 },
        UNKNOWN_USER: { name: "UNKNOWN_USER", msg: "Occur when a user is unknown.", code: 401 },
        SAVE_ERROR: { name: "SAVE_ERROR", msg: "Occur when a save fail.", code: 500 },
        VALIDATION_ERROR: { name: "VALIDATION_ERROR", msg: "Occur when a field is incorrect.", code: 400 },
        GET_GYMS_ERROR: { name: "GET_GYMS_ERROR", msg: "Occur when a gym fetch fail.", code: 500 }
    },
    BCRYPT_ERRORS: {
        GEN_SALT_ERROR: { name: "GEN_SALT_ERROR", msg: "Occur when bcrypt.genSalt fail.", code: 500 },
        HASH_ERROR: { name: "HASH_ERROR", msg: "Occur when bcrypt.hash fail.", code: 500 },
        COMPARE_PASSWORDS_ERROR: { name: "COMPARE_PASSWORDS_ERROR", msg: "Occur when comparing the stored password and the proposed one with bcrypt.", code: 500 },
    },
    CACHE_ERRORS: {
        GET_ERROR: { name: "GET_ERROR", msg: "Occur when a get fail.", code: 500 },
        SET_UNKNOWN_ERROR: { name: "SET_UNKNOWN_ERROR", msg: "Occur when a set cache is not a success and is not an error.", code: 500 },
        SET_ERROR: { name: "SET_ERROR", msg: "Occur when a set cache fail.", code: 500 },
        SET_ERROR2: { name: "SET_ERROR", msg: "Occur when a set cache fail and succeed.", code: 500 },
    },
    OTHERS: {
        ERROR: { name: "ERROR", msg: "Occur when a dependency throw his own error.", code: 500 },
        APPLY_ERROR: { name: "APPLY_ERROR", msg: "Occur when the applied function has throw an error.", code: 500 },
        BAD_GYM_OWNER: { name: "BAD_GYM_OWNER", msg: "Occur when someone pretend to own a gym and doesn't.", code: 403 },
        INVALID_USERS: { name: "INVALID_USERS", msg: "Occur when trying to add invalid users.", code: 400 },
        INVALID_GYM: { name: "INVALID_GYM", msg: "Occur when a gym field is undefined.", code: 400 },
        VALIDATION_ERROR: { name: "VALIDATION_ERROR", msg: "Occur when a validation failed.", code: 400 },
    }
};

const prodConfig = {
    port: 8081,
    staticPath: __dirname + '/static',
    pool: {
        connectionLimit: 100,
        host: '',
        user: '',
        password: '',
        database: ''
    },
    token: {
        secret: '', // we should use a rsa certificate
        options: {
            expiresIn: 50400,
            audience: '', // To define
            issuer: '' // To define
        }
    },
    loggerLevel: 'info',
    errors
};

const devConfig = {
    port: 8081,
    staticPath: __dirname + '/static',
    pool: {
        connectionLimit: 100,
        host: '127.0.0.1',
        user: 'root',
        password: 'droopy1',
        database: 'mydb'
    },
    token: {
        secret: 'a]4@SjZed*FU>L-9563e',
        options: {
            expiresIn: 50400,
            audience: 'http://localhost:8090/',
            issuer: 'http://localhost:8081/'
        }
    },
    loggerLevel: 'debug',
    errors
};

module.exports = process.env.NODE_ENV === 'production' ? prodConfig : devConfig;