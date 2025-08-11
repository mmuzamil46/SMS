const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
    getAllTeachers,
    getTeacherById,
    getTeacherByUserId,
    createTeacher,
    updateTeacher,
    deleteTeacher
} = require('../controllers/teacherController');
const { auth, authorizeRoles } = require('../middleware/authMidleware');

router.post('/',auth,authorizeRoles('admin','student'),upload.single('photo'), createTeacher);
router.get('/',auth,authorizeRoles('admin','student'), getAllTeachers);
router.get('/:id',auth,authorizeRoles('admin','teacher'))
router.get('/:id',auth,authorizeRoles('admin','teacher'), getTeacherById);
router.put('/:id', auth,authorizeRoles('admin','student'),upload.single('photo'),updateTeacher);
router.delete('/:id',auth,authorizeRoles('admin'), deleteTeacher);

module.exports = router;