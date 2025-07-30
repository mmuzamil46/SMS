const router = require('express').Router();
const feeCtrl = require('../controllers/feeController');
const { auth, authorizeRoles } = require('../middleware/authMidleware');

router.post('/', auth,authorizeRoles('finance'),feeCtrl.createFee);                
router.put('/:id/pay',auth,authorizeRoles('finance'), feeCtrl.payFee);            
router.get('/student/:studentId',auth,authorizeRoles('finance'), feeCtrl.getStudentFees);
router.get('/summary/:studentId',auth,authorizeRoles('finance'), feeCtrl.studentSummary);
router.get('/',auth,authorizeRoles('finance'), feeCtrl.getAllFees);                
router.get('/receipt/:feeId',auth,authorizeRoles('finance'), feeCtrl.getFeeReceipt);

module.exports = router;
