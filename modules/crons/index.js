/*
Copyright (C) Hugo Da Roit <contact@hdaroit.fr> - All Rights Reserved
Unauthorized copying of this file, via any medium is strictly prohibited
Proprietary and confidential
Written by Hugo Da Roit <contact@hdaroit.fr>, 2017
Based on Vue-admin from Fangdun Cai <cfddream@gmail.com>
*/

const cron = require('cron');
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

module.exports = {
  mongoStatsJob,
  mongoBackupJob
};