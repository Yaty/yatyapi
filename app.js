const config = require('./config');
const logger = require('./modules/logger');
const cron = require('cron');
const express = require('express');
const app = express();

// Launch Mongoose
require('./modules/mongodb/connection')();

// CORS when we are in dev
app.use(require('cors')());

// JSON Body-parser
app.use(require('body-parser').json());

// Logging HTTP request
app.use(require('morgan')("combined", { stream: { write: message => logger.info(message.trim()) }}));

// Routes
app.use('/static', express.static(config.staticPath));
app.use('/auth', require('./routers/auth'));

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

// Crons
const mongoStatsJob = new cron.CronJob({
    cronTime: '00 00 00 * * *', // Run everyday at 00h00
    onTick() {
        console.log('Making mongodb stats');
    }
});

const mongoBackupJob = new cron.CronJob({
    cronTime: '00 00 03 * * *', // Run everyday at 03h00
    onTick() {
        console.log('Making mongodb backup');
    }
});

mongoStatsJob.start();
mongoBackupJob.start();