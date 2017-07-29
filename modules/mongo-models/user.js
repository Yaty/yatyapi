const config = require('../../config');
const logger = require('../logger');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;

const GymSchema = new Schema({
    name: { type: String, required: true },
    rank: { type: String, required: true, enum: ['climber', 'routesetter', 'owner'], default: 'climber' },
});

const UserSchema = new Schema({
    name: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true },
    gyms: { type: [GymSchema], required: false, default: [] },
    phone: { type: String, required: false, validate: { validator: v => { return /^[0-9]{10}$/.test(v) }, message: '{VALUE} is not a valid phone number!' } },
    address: { type: String, required: false },
    lastLogin: { type: Date, required: true },
    tokenId: { type: String, required: false }
});

UserSchema.pre('save', function(next) {
    const user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('User', UserSchema);
