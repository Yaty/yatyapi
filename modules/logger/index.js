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

const winston = require('winston');

const timestamp = () => { return Date.now() };
const formatter = (options) => {
    return `${options.timestamp()} ${options.level.toUpperCase()} ${options.message ? options.message : ''}
            ${options.meta && Object.keys(options.meta).length ? `${JSON.stringify(options.meta)}` : ''}`;
};

const logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            timestamp, formatter
        }),
        new (winston.transports.File)({
            timestamp, formatter,
            name: 'info-file',
            filename: 'info.log',
            level: 'info'
        }),
        new (winston.transports.File)({
            timestamp, formatter,
            name: 'error-file',
            filename: 'error.log',
            level: 'error'
        })
    ]
});

logger.level = require('../../config').loggerLevel;

module.exports = logger;