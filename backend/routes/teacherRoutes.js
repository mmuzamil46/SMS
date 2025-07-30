const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
    getAllTeachers,
    getTeacherById,
    createTeacher,
    updateTeacher,
    deleteTeacher
} = require('../controllers/teacherController');
const { auth, authorizeRoles } = require('../middleware/authMidleware');

router.post('/',auth,authorizeRoles('admin'),upload.single('photo'), createTeacher);
router.get('/',auth,authorizeRoles('admin'), getAllTeachers);
router.get('/:id',auth,authorizeRoles('admin','teacher'), getTeacherById);
router.put('/:id', auth,authorizeRoles('admin'),updateTeacher);
router.delete('/:id',auth,authorizeRoles('admin'), deleteTeacher);

module.exports = router;