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
        if (type instanceof CustomError) {
            this._type = type.type;
            this._message = (message ? ' / ' + message : '') + type.message ;
            this._error = (error ? ' / ' + error : '') + type.error;
        // If type.name, msg and code is defined we suppose it's a defined error type (see TYPES)
        } else if (type.name && type.msg && type.code) {
            this._type = type;
            this._message = message;
            this._error = error;
        // Other errors
        } else {
            this._type = CustomError.TYPES.OTHERS.ERROR;
            this._message = message;
            this._error = type;
        }
    }

    static get TYPES() {
        return require('../../config').errors;
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