const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const accountSchema = new Schema({
    username: {type: String, required: [true, 'username is required']},
    email: {type: String, required: [true, 'email is required']},
    password: {type: String, required: [true, 'password is required']}
});

module.exports = mongoose.model('Account', accountSchema);
