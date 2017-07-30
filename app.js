const config = require('./config');
const logger = require('./modules/logger');
const express = require('express');
const app = express();

// TODO : remove once in production
app.use(require('cors')());

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