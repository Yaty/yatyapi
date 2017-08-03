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

const connect = () => {
    return new Promise((resolve, reject) => {
        mongoose.connect(config.mongodb, { useMongoClient: true }, (e) => {
            if (e) return reject(new CustomError(CustomError.TYPES.MONGODB_ERRORS.CONNECTION_ERROR, "", e));
            require('./mongo-models'); // Init all models
            logger.info('Successfully connected to MongoDB.');
            return resolve();
        });
    });
};

module.exports = connect;
