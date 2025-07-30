const Fee = require('../models/fee');
const mongoose = require('mongoose');
const Student = require('../models/student');

exports.createFee = async (req, res) => {
  try {
    const fee = await Fee.create(req.body);          // body matches schema
    res.status(201).json({ message: 'Fee created', fee });
  } catch (err) {
    res.status(500).json({ message: 'Create error', error: err.message });
  }
};

//  Mark a fee as PAID
exports.payFee = async (req, res) => {
  try {
    const { paymentMethod = 'cash' } = req.body;
    const fee = await Fee.findByIdAndUpdate(
      req.params.id,
      { status: 'paid', paidDate: new Date(), paymentMethod },
      { new: true }
    );
    if (!fee) return res.status(404).json({ message: 'Fee not found' });
    res.json({ message: 'Payment recorded', fee });
  } catch (err) {
    res.status(500).json({ message: 'Payment error', error: err.message });
  }
};

//  All fees for ONE student  ( ?status=paid|unpaid  &  ?overdue=true )
exports.getStudentFees = async (req, res) => {
  try {
    const filter = { student: req.params.studentId };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.overdue === 'true') filter.dueDate = { $lt: new Date() , $ne: null };

    const fees = await Fee.find(filter).sort({ dueDate: 1 });
    res.json(fees);
  } catch (err) {
    res.status(500).json({ message: 'Fetch error', error: err.message });
  }
};

//  Quick balance summary for a student
exports.studentSummary = async (req, res) => {
  try {
    const pipeline = [
      { $match: { student: new mongoose.Types.ObjectId(req.params.studentId) } },
      { $group: {
          _id: '$status',
          total: { $sum: '$amount' }
      }}
    ];
    const agg = await Fee.aggregate(pipeline);

    const paid    = agg.find(a => a._id === 'paid')?.total || 0;
    const unpaid  = agg.find(a => a._id === 'unpaid')?.total || 0;
    res.json({ paid, unpaid, balance: unpaid });
  } catch (err) {
    res.status(500).json({ message: 'Summary error', error: err.message });
  }
};

// Admin list with filters ?status=&student=&from=&to=
exports.getAllFees = async (req, res) => {
  try {
    const { status, student, from, to } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (student) filter.student = student;
    if (from || to) {
      filter.dueDate = {};
      if (from) filter.dueDate.$gte = new Date(from);
      if (to)   filter.dueDate.$lte = new Date(to);
    }
    const fees = await Fee.find(filter)
                          .populate('student', 'studentId')   // just id string
                          .sort({ dueDate: 1 });
    res.json(fees);
  } catch (err) {
    res.status(500).json({ message: 'Admin fetch error', error: err.message });
  }
};


exports.getFeeReceipt = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.feeId)
      .populate({
        path: 'student',
        populate: { path: 'user' }
      });

    if (!fee || fee.status !== 'paid') {
      return res.status(404).json({ message: 'Paid fee not found' });
    }

    const receipt = {
      receiptNo: 'REC-' + fee._id.toString().slice(-6).toUpperCase(),
      studentName: fee.student.user?.name || 'N/A',
      studentId: fee.student.studentId || 'N/A',
      amount: fee.amount,
      paymentMethod: fee.paymentMethod,
      paidDate: fee.paidDate ? new Date(fee.paidDate).toLocaleDateString() : 'N/A',
      createdAt: new Date(fee.createdAt).toLocaleDateString(),
      generatedAt: new Date().toLocaleString(),
      note: 'Thank you for your payment.'
    };

    res.status(200).json(receipt);

  } catch (err) {
    res.status(500).json({ message: 'Error generating receipt', error: err.message });
  }
};