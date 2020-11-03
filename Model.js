const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {
        type: String,
    },
    id: {
        type: Number,
        required: true
    }
})

module.exports = User = mongoose.model('subscribers', UserSchema);