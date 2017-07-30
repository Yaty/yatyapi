/*
Copyright (C) Hugo Da Roit <contact@hdaroit.fr> - All Rights Reserved
Unauthorized copying of this file, via any medium is strictly prohibited
Proprietary and confidential
Written by Hugo Da Roit <contact@hdaroit.fr>, 2017
Based on Vue-admin from Fangdun Cai <cfddream@gmail.com>
*/

const auth = require('./auth');

module.exports = {
    errorHandler: require('./error'),
    jwtSign: auth.signJWT,
    jwtCheck: auth.checkJWT
};