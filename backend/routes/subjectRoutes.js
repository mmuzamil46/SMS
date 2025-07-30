const express =require('express');
const router = express.Router();

const {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject
} = require('../controllers/subjectController.js');
const {auth, authorizeRoles} =require('../middleware/authMidleware.js')
router.post('/',auth,authorizeRoles('admin'), createSubject);
router.get('/',auth,authorizeRoles('admin'), getAllSubjects);
router.get('/:id',auth,authorizeRoles('admin'), getSubjectById);
router.put('/:id',auth,authorizeRoles('admin'), updateSubject);
router.delete('/:id',auth,authorizeRoles('admin'), deleteSubject);

module.exports = router