/*
Copyright (C) Hugo Da Roit <contact@hdaroit.fr> - All Rights Reserved
Unauthorized copying of this file, via any medium is strictly prohibited
Proprietary and confidential
Written by Hugo Da Roit <contact@hdaroit.fr>, 2017
Based on Vue-admin from Fangdun Cai <cfddream@gmail.com>
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