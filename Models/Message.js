const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const messageSchema = new Schema({
    conversationId: {
        type: String,
        required: true,
        ref: 'Conversation'
    },
    senderId: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
    },
    status: {
        type: String,
    }
},{timestamps:true});

module.exports = mongoose.model('Message', messageSchema);