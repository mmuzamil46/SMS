const express = require('express');
const router = express.Router();

const { registerUser, loginUser} = require('../controllers/authController');
const { auth, authorizeRoles } = require('../middleware/authMidleware');

router.post('/register',auth,authorizeRoles('admin'),registerUser);
router.post('/login', loginUser);

module.exports = router;