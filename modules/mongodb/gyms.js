/*
Copyright (C) Hugo Da Roit <contact@hdaroit.fr> - All Rights Reserved
Unauthorized copying of this file, via any medium is strictly prohibited
Proprietary and confidential
Written by Hugo Da Roit <contact@hdaroit.fr>, 2017
Based on Vue-admin from Fangdun Cai <cfddream@gmail.com>
*/

const CustomError = require('../errors').CustomError;
const Gym = require('./mongo-models').gym;

const getGyms = () => {
    return new Promise((resolve ,reject) => {
        Gym.find({}, (err, gyms) => {
            if (err) return reject(new CustomError(CustomError.TYPES.MONGODB_ERRORS.GET_GYMS_ERROR, '', err))
            return resolve(gyms);
        });
    });
};

module.exports = {
    getGyms
};