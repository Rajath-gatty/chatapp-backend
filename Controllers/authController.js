const {validationResult} =require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../Models/User');

exports.postSignup = async(req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){  
        return res.status(422).json({errors:errors.array()});
    }
    const {name,username,email,password} = req.body;
    const hashedPassword = await bcrypt.hash(password,10);
    const user = new User({name,username,email,password:hashedPassword});
    await user.save();
    res.send('Signup Done!');
}

exports.postLogin = async(req,res) => {
    const {email,password} = req.body;
    const user = await User.findOne({email});
    if(!user){
        return res.status(401).json({errors:[{msg:'Invalid Credentials'}]});
    }
    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch){
        return res.status(401).json({errors:[{msg:'Invalid Credentials'}]});
    }
    const token = jwt.sign({id:user._id,email:user.email},process.env.JWT_SECRET);
    
    const newUser = {_id:user._id,name:user.name,username:user.username,email:user.email,profileUrl:user.profileUrl,createdAt:user.createdAt};

    res.send({user:newUser,token});
}