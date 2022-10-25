const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const conversationSchema = new Schema({
    participants: [{type: Schema.Types.ObjectId, ref: 'User'}],
    group: {
        type: Boolean,
        required: true
    },
},{timestamps:true});
module.exports = mongoose.model('Conversation', conversationSchema);