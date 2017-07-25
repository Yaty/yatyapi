const config = require('./config');
const express = require('express');
const bodyparser = require('body-parser');
const app = express();
const cors = require('cors');
const cookieparser = require('cookie-parser');
const logger = require('./modules/logger');
const morgan = require('morgan');
const usersApi = require('./routers/users');
const authApi = require('./routers/auth');

// TODO : remove once in production
app.use(cors());

app.use(cookieparser());

app.use(bodyparser.json());

// Logging HTTP request
app.use(morgan("combined", { stream: { write: message => logger.info(message.trim()) }}));

// Routes
app.use('/static', express.static(config.staticPath));
app.use('/api/users', usersApi);
app.use('/api/auth', authApi);

// Listening
app.listen(config.port, () => {
    logger.info(`Server launched on ${config.port}`);
});