/*
Copyright (C) Hugo Da Roit <contact@hdaroit.fr> - All Rights Reserved
Unauthorized copying of this file, via any medium is strictly prohibited
Proprietary and confidential
Written by Hugo Da Roit <contact@hdaroit.fr>, 2017
Based on Vue-admin from Fangdun Cai <cfddream@gmail.com>
*/

const config = require('../../config');
const logger = require('../logger');
const mongoose = require('mongoose');
const CustomError = require('../errors').CustomError;
mongoose.Promise = global.Promise;

const connect = function() {
    mongoose.connect(config.mongodb, { useMongoClient: true }, (e) => {
        if (e) throw new CustomError(CustomError.TYPES.MONGODB_ERRORS.CONNECTION_ERROR, "", e);
        logger.info('Successfully connected to MongoDB.');
    });
};

module.exports = connect;
