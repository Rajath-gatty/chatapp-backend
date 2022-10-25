const Conversation = require('../Models/Conversation');
const User = require('../Models/User');
const Message = require('../Models/Message');
const {BlobServiceClient, StorageSharedKeyCredential, } = require("@azure/storage-blob");

const account='chatapp1';
const accountKey=process.env.AZURE_STORAGE_ACCOUNT_KEY;
const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
const blobServiceClient = new BlobServiceClient(
`https://${account}.blob.core.windows.net`,
sharedKeyCredential
);
const containerClient = blobServiceClient.getContainerClient('chatapp');

exports.postConversation = (req,res) => {
    const {participants, group} = req.body;
    const newConversation = new Conversation({participants, group});
    newConversation.save();
    res.send('ok');
}

exports.getConversation = async(req,res) => {
    const {userId} = req;

    const result = await Conversation.find({participants:{$all:[userId]}},{participants: {$elemMatch: {$ne: userId}}, group: 1}).populate('participants', 'name username profileUrl');

    res.send(result);
}

exports.getUsers = async(req,res) => {
    const {userId} = req;
    const {search} = req.body;

    try {
        const user = await User.find({_id:userId},{conversations:1, _id:0});

        const users = await User.find({_id:{$ne:userId},conversations:{$nin:user[0].conversations},username:{$regex:search,$options:'i'}},{name:1, username:1,profileUrl:1, _id:1},{limit:1});
        res.send(users);

    } catch (error) {
        console.log(error);
        res.status(500).send('Server error');
    }
}

exports.getMessages = async(req,res) => {
    const {conversationId} = req.body;

    try {
        const message = await Message.find({conversationId});
        res.send(message);
    } catch (error) {
        console.log(error);
        res.status(500).send('Server error');
    }
}

exports.postMessage = async(req,res) => {
    const {id,content,newChat} = req.body;
    const {userId} = req;

    try {
        if(newChat){
            const newId = Array.isArray(id) ? [userId,...id] : [userId,id];
            const conversation = new Conversation({participants:newId, group:newId.length>2});
            const conv = await conversation.save();
            
            const newMessage = await Message.create({conversationId:conv._id,content,senderId:userId});
   
            await User.updateMany({_id:{$in:newId}},{$push:{conversations:conv._id}});
            const updatedMessage = {...newMessage,_id:conv._id}
            res.send(updatedMessage);
        } else {
            const newMessage = await Message.create({conversationId:id,senderId:userId,content});
            const eventEmitter = req.app.get('eventEmitter');
            eventEmitter.emit('new Message',newMessage);
            res.send(newMessage);
        }  
    } catch (error) {
        console.log(error);
        res.status(500).send('Server error');
    }
}

exports.postProfile = async(req,res) => {
    const {userId} = req;
    const {profileUrl} = req.body;
    const file = req.file;
    const fileType = file.mimetype.split('/')[1];
    const uid = (Math.random() + 1).toString(36).substring(2);
    const fileName = `${userId}-${uid}.${fileType}`;

    try {
        const blockBlobClient =  containerClient.getBlockBlobClient(fileName);
        blockBlobClient['Metadata']=userId;

        await blockBlobClient.uploadData(file.buffer);
        const imageUrl = `https://${account}.blob.core.windows.net/chatapp/${fileName}`;

        await User.findByIdAndUpdate(userId,{profileUrl:imageUrl},{useFindAndModify:false});
        res.send(imageUrl);
        if(profileUrl){
            await containerClient.getBlockBlobClient(profileUrl.split('chatapp/')[1]).delete();
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Server error');
    }
}