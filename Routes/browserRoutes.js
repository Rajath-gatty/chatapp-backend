const router = require("express").Router();
const browserController = require("../Controllers/browserController");
const isAuth = require("../middleware/isAuth");
const multer = require("multer");

const storage = multer.memoryStorage();
const parser = multer({ storage: storage });

router.post('/new-conversation',isAuth,browserController.postConversation);
router.post('/conversation',isAuth,browserController.getConversation);

router.post('/getUsers',isAuth,browserController.getUsers);

router.post('/messages',isAuth,browserController.getMessages);
router.post('/postMessage',isAuth,browserController.postMessage);

router.post('/profile',parser.single('profile'),isAuth,browserController.postProfile);

module.exports = router;