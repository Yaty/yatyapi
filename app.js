/*
Copyright (C) Hugo Da Roit <contact@hdaroit.fr> - All Rights Reserved
Unauthorized copying of this file, via any medium is strictly prohibited
Proprietary and confidential
Written by Hugo Da Roit <contact@hdaroit.fr>, 2017
Based on Vue-admin from Fangdun Cai <cfddream@gmail.com>
*/

// TODO : Validation
// TODO : Caching

const config = require('./config');
const logger = require('./modules/logger');
const express = require('express');
const validator = require('express-validator');
const routers = require('./routers');
const app = express();
const crons = require('./modules/crons');

// Enabling CORS
app.use(require('cors')());

// JSON Body-parser
app.use(require('body-parser').json({ limit: '16mb'}));
app.use(validator({
    customValidators: {
        isArray: (value) => {
            return Array.isArray(value);
        },
        isObject: (value) => {
            return typeof value === 'object';
        }
    }
}));

// Logging HTTP request
app.use(require('morgan')("combined", { stream: { write: message => logger.info(message.trim()) }}));

// Routes
app.use('/static', express.static(config.staticPath));
app.use('/auth', routers.auth);
app.use('/gyms', routers.gyms);
app.use('/users', routers.users);

// Error handler
app.use(require('./modules/middlewares').errorHandler);

// Listening
app.listen(config.port, () => {
    logger.info(`Server launched on ${config.port}`);
});

// Logging unhandled rejected promises
process.on('unhandledRejection', (reason) => {
    logger.warn('Unhandled promise rejection', { reason });
});

// Starting CRON jobs
Object.keys(crons).forEach(job => crons[job].start());
