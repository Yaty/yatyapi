/*
Yaty - Climbing Gym Management
Copyright (C) 2017 - Hugo Da Roit <contact@hdaroit.fr>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

const cron = require('cron');
const mongoStatsJob = new cron.CronJob({
    cronTime: '00 00 00 * * *', // Run everyday at 00h00
    onTick() {
        console.log('Making db stats');
    }
});
const mongoBackupJob = new cron.CronJob({
    cronTime: '00 00 03 * * *', // Run everyday at 03h00
    onTick() {
        console.log('Making db backup');
    }
});

module.exports = {
  mongoStatsJob,
  mongoBackupJob
};