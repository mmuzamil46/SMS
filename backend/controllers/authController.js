const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res) =>{
    try{
       const {name,username, email, password, role } = req.body;
       const existingUser =  await User.findOne({username});
       if(existingUser)
        return res.status(400).json({message : 'User already exists'});

       const hashedPassword = await bcrypt.hash(password, 10);
       const user = new User({name, username, email, password:hashedPassword, role});
        await user.save();

        res.status(201).json({message : 'User registered successfully'});


    } catch(err){
        //console.log(error);
        res.status(500).json({message : 'Something went wrong', error:err});
    }
}

exports.loginUser = async (req, res)=>{
 
    
    try{
const {username, password } = req.body;


const user = await User.findOne({username});
if(!user){
    return res.status(400).json({message : 'Username does not exist'});
}
const isPass = await bcrypt.compare(password, user.password);
if(!isPass){
    return res.status(400).json({message: 'incorrect password'});
}
const token = jwt.sign({userId: user._id, role: user.role}, process.env.JWT_SECRET, {expiresIn: '1h'});
const {password: _, ...userWithoutPassword} = user.toObject();
res.status(200).json({token,user: userWithoutPassword});
}
    catch(err){
res.status(500).json({message : 'login failed!!', error:err});
    }
}