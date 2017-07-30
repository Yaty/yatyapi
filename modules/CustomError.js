/*
Copyright (C) Hugo Da Roit <contact@hdaroit.fr> - All Rights Reserved
Unauthorized copying of this file, via any medium is strictly prohibited
Proprietary and confidential
Written by Hugo Da Roit <contact@hdaroit.fr>, 2017
Based on Vue-admin from Fangdun Cai <cfddream@gmail.com>
*/

class CustomError {
    constructor (type, message, error) {
        // If it's already a CustomError we make a shallow copy
        if (typeof type === CustomError) {
            this._type = type.type;
            this._message = type.message;
            this._error = type.error;
        // If the three fields are defined then it's a normal error
        } else if (type && message && error) {
            this._type = type;
            this._message = message;
            this._error = error;
        // Other errors
        } else {
            this._type = TYPES.OTHERS.ERROR;
            this._message = message;
            this._error = type;
        }
    }

    static get TYPES() {
        return {
            JWT_ERRORS: {
                COMPARE_PASSWORDS_ERROR: { name: "COMPARE_PASSWORDS_ERROR", msg: "Occur when comparing the stored password and the proposed one with bcrypt.", code: 500 }
            },
            AUTH_ERRORS: {
                BAD_PASSWORD: { name: "BAD_PASSWORD", msg: "Occur when a password is wrong.", code: 401 }
            },
            MONGODB_ERRORS: {
                CONNECTION_ERROR: { name: "CONNECTION_ERROR", msg: "Occur when a MongoDB connection fail.", code: 500 },
                SEARCH_USER_ERROR: { name: "SEARCH_USER_ERROR", msg: "Occur when a user search fail.", code: 500 },
                UNKNOWN_USER: { name: "UNKNOWN_USER", msg: "Occur when a user is unknown.", code: 401 },
                SAVE_ERROR: { name: "SAVE_ERROR", msg: "Occur when a save fail.", code: 500 },
                VALIDATION_ERROR: { name: "VALIDATION_ERROR", msg: "Occur when a field is incorrect.", code: 400 }
            },
            OTHERS: {
                ERROR: { name: "ERROR", msg: "Occur when a dependency throw his own error", code: 500 }
            }
        };
    }

    get type() {
        return this._type;
    }

    get error() {
        return this._error;
    }

    get message() {
        return this._message;
    }

}

module.exports = CustomError;