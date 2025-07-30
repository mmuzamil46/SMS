const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

const {
    getAllStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent
} = require('../controllers/studentController');
const { auth, authorizeRoles } = require('../middleware/authMidleware');

router.get('/',auth,authorizeRoles('admin','teacher','student'), getAllStudents);
router.get('/:id',auth,authorizeRoles('admin','student','teacher'), getStudent);
router.post('/',auth,authorizeRoles('admin','student'),upload.single('photo'),createStudent);
router.put('/:id',auth,authorizeRoles('admin', 'student'),upload.single('photo'), updateStudent);
router.delete('/:id',auth,authorizeRoles('admin','student'), deleteStudent);

module.exports = router;