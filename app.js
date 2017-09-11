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
