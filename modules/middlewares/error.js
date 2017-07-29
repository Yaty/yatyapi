/*
Copyright (C) Hugo Da Roit <contact@hdaroit.fr> - All Rights Reserved
Unauthorized copying of this file, via any medium is strictly prohibited
Proprietary and confidential
Written by Hugo Da Roit <contact@hdaroit.fr>, 2017
Based on Vue-admin from Fangdun Cai <cfddream@gmail.com>
*/

const logger = require('../logger');

const errorHandler = (err, req, res, next) => {
    logger.error('Express error catcher', { err });
    if (res.headersSent) {
        return next(err);
    }
    return res.sendStatus(500);
};

module.exports = errorHandler;