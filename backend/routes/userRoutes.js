const express = require('express');
const router = express.Router();
const {getUsers } = require('../controllers/userController');
const { auth, authorizeRoles } = require('../middleware/authMidleware');

router.get('/',auth,authorizeRoles('admin'), getUsers);

module.exports = router;