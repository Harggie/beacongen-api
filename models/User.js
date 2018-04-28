// User model
const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
});
mongoose.model('User', UserSchema);

module.exports = {
    User: mongoose.model('User'),
}