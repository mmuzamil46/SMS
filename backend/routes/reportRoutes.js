const express = require('express');
const router = express.Router();
const { getStudentReportCard 
    ,getStudentSubjectPerformance
} = require('../controllers/reportController');
const { auth, authorizeRoles } = require('../middleware/authMidleware');

router.get('/report-card/:studentId',auth,authorizeRoles('student' ,'teacher'), getStudentReportCard);
router.get('/subject-performance/:studentId/:subjectId',auth,authorizeRoles('student' ,'teacher'), getStudentSubjectPerformance);

module.exports = router;
