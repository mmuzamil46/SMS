const express = require('express');
const router = express.Router();
const {getUsers ,createUser} = require('../controllers/userController');
const { auth, authorizeRoles } = require('../middleware/authMidleware');


router.post('/', createUser);
router.get('/',auth,authorizeRoles('admin'), getUsers);

module.exports = router;