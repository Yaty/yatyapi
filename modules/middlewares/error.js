/*
Copyright (C) Hugo Da Roit <contact@hdaroit.fr> - All Rights Reserved
Unauthorized copying of this file, via any medium is strictly prohibited
Proprietary and confidential
Written by Hugo Da Roit <contact@hdaroit.fr>, 2017
Based on Vue-admin from Fangdun Cai <cfddream@gmail.com>
*/

const logger = require('../logger');
const CustomError = require('../errors').CustomError;

const errorHandler = (err, req, res, next) => {
    const error = new CustomError(err);
    (error.type.code >= 500 && error.type.code <= 599 ? logger.error : logger.info)('Express error catcher', { error });
    if (res.headersSent) return next(error);
    return res.sendStatus(error.type.code);
};

module.exports = errorHandler;