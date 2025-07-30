const express = require('express')
const router = express.Router();
const { auth, authorizeRoles } = require('../middleware/authMidleware');
const {
    createClass,
    getAllClasses,
    getClassById,
    updateClass,
    deleteClass,
   

    

} = require('../controllers/classController')


router.post('/',auth,authorizeRoles('admin'), createClass);
router.get('/', auth,authorizeRoles('admin','student'),getAllClasses);
// router.get('/with-students', auth, authorizeRoles('admin','student'), getClassesWithStudentCount);
router.get('/:id', auth,authorizeRoles('admin'),getClassById);
router.put('/:id', auth,authorizeRoles('admin'),updateClass);
router.delete('/:id', auth,authorizeRoles('admin'),deleteClass);

module.exports = router;