/*
Copyright (C) Hugo Da Roit <contact@hdaroit.fr> - All Rights Reserved
Unauthorized copying of this file, via any medium is strictly prohibited
Proprietary and confidential
Written by Hugo Da Roit <contact@hdaroit.fr>, 2017
Based on Vue-admin from Fangdun Cai <cfddream@gmail.com>
*/

const config = require('../../../config');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const GymSchema = new Schema({
    name: { type: String, required: true },
    rank: { type: String, required: true, enum: ['climber', 'routesetter', 'owner'], default: 'climber' },
});

module.exports = mongoose.model('Gym', GymSchema);
