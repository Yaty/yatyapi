const winston = require('winston');

const timestamp = () => { return Date.now() };
const formatter = (options) => {
    return `${options.timestamp()} ${options.level.toUpperCase()} ${options.message ? options.message : ''}
            ${options.meta && Object.keys(options.meta).length ? `\\n\\t ${JSON.stringify(options.meta)}` : ''}`;
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

module.exports = logger;