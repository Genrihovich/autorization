const { Schema, model } = require('mongoose');

//Створимо схему - які поля будуть у юзера
const UserShema = new Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    isActivated: { type: Boolean, default: false },
    activationlink: { type: String }
})

module.exports = model('User', UserShema);