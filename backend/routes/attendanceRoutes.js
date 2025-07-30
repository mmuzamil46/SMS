const express = require('express');
const router = express.Router();
const { auth, authorizeRoles } = require('../middleware/authMidleware');


const {
  markAttendance,
  getAttendance,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
  getAttendanceSummary,
  getClassMonthlyAttendance
} = require('../controllers/attendanceController');

router.post('/',auth,authorizeRoles('teacher'),markAttendance);
router.get('/', auth,authorizeRoles('teacher'),getAttendance);
router.get('/summary',auth,authorizeRoles('teacher'), getAttendanceSummary);
router.get('/summary/class-daily',auth,authorizeRoles('teacher'), getClassMonthlyAttendance);
router.get('/:id',auth,authorizeRoles('teacher'), getAttendanceById);
router.put('/:id', auth,authorizeRoles('teacher'),updateAttendance);
router.delete('/:id',auth,authorizeRoles('teacher'), deleteAttendance);


module.exports = router;
