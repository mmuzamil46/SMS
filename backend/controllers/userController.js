const User = require('../models/user');

exports.getUsers = async (req, res) =>{
    try {
        const users = await User.find().select('-password');
        res.status(200).json({users});
    } catch (error) {
        res.status(500).json({message : 'failed to fetch users', error:error});
    }
}