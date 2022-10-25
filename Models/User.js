const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema({
    name: {
        type: String,
        required:true
    },
    username: {
        type: String,
        required:true
    },
    email: { 
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    profileUrl: {
        type: String,
        default:null
    },
    conversations:[{type: Schema.Types.ObjectId, ref: 'Conversation'}],
    lastLogin: {
        type: Date,
        required: false
    },
},{timestamps:true});
module.exports = mongoose.model('User', userSchema);
