const express = require('express');
const router = express.Router();
const { auth ,authorizeRoles } = require('../middleware/authMidleware');
const {
  createGrade,
  getGrades,
  getGradeById,
  updateGrade,
  deleteGrade
} = require('../controllers/gradeController');


router.post('/',auth,authorizeRoles('teacher'), createGrade);
router.get('/',auth,authorizeRoles('teacher'), getGrades);
router.get('/:id',auth,authorizeRoles('teacher','student'),  getGradeById);
router.put('/:id',auth,authorizeRoles('teacher'),  updateGrade);
router.delete('/:id', auth,authorizeRoles('teacher'), deleteGrade);

module.exports = router;
