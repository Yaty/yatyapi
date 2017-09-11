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

class CustomError extends Error {
    constructor (type, message, error) {
        super();
        // If it's already a CustomError we make a shallow copy
        if (type instanceof CustomError) {
            this._type = type.type;
            this._message = (message ? message + ' / ' : '') + type.message;
            this._error = (error ? error + ' / ' : '') + type.error;
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