const router = require("express").Router();
const authController = require("../Controllers/authController");
const User = require("../Models/User");
const {body} = require('express-validator');

router.post('/signup',[
    body('name').trim().isLength({min:3}).withMessage('Name must be atleast 3 characters long'),
    body('username').trim().toLowerCase().isLength({min:3}).withMessage('username required').custom((value)=>{
        return User.findOne({username:value}).then(user=>{
            if(user){
                return Promise.reject('Username already exists');
            } else {
                return true;
            }
        })
    }),
    body('email').trim().isEmail().withMessage('Email is not valid').custom((value)=>{
        return User.findOne({email:value}).then(user=>{
            if(user){
                return Promise.reject('Email already exists');
            } else {
                return true;
            }
        })
    }),
    body('password').trim().isLength({min:4}).withMessage('Password must be atleast 4 characters long')
],authController.postSignup);

router.post('/login',authController.postLogin);

module.exports = router;