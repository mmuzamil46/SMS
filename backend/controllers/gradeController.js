const Grade = require('../models/grade');

exports.createGrade = async (req, res) => {
  try {
    const { student, subject, class: classId, score,outOf, term, examType, academicYear } = req.body;

    const grade = await Grade.create({
      student,
      subject,
      class: classId,
      score,
      outOf,
      term,
      examType,
      academicYear
    });

    res.status(201).json({ message: 'Grade recorded', grade });
  } catch (err) {
    res.status(500).json({ message: 'Error recording grade', error: err.message });
  }
};
// POST /grades/bulk
exports.createBulkGrades = async (req, res) => {
  try {
    
    
    const grades = await Grade.insertMany(req.body);
    res.status(200).json(grades);
  } catch (err) {
    res.status(500).json({ message: 'Error creating bulk grades', error: err.message });
  }
};

exports.getGrades = async (req, res) => {
  try {
    const grades = await Grade.find()
      .populate('student')
      .populate('subject')
      .populate('class');

    res.status(200).json(grades);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching grades', error: err.message });
  }
};

exports.getFilteredGrades = async (req, res) => {
  try {
    const { classId, subjectId, term } = req.query;
    
    if (!classId || !subjectId || !term) {
      return res.status(400).json({ 
        message: 'classId, subjectId, and term are required' 
      });
    }

    const grades = await Grade.find({
      'class': classId,
      'subject': subjectId,
      'term': term
    })
    .populate('student', 'studentId fullName')
    .populate('class', 'name section')
    .populate('subject', 'name')
    .sort('createdAt');

    res.json(grades);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.getGradeById = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id)
      .populate('student')
      .populate('subject')
      .populate('class');

    if (!grade) return res.status(404).json({ message: 'Grade not found' });
    res.status(200).json(grade);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching grade', error: err.message });
  }
};

exports.updateGrade = async (req, res) => {
  try {
    const grade = await Grade.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('student')
      .populate('subject')
      .populate('class');

    if (!grade) return res.status(404).json({ message: 'Grade not found' });
    res.status(200).json(grade);
  } catch (err) {
    res.status(500).json({ message: 'Error updating grade', error: err.message });
  }
};

exports.deleteGrade = async (req, res) => {
  try {
    const grade = await Grade.findByIdAndDelete(req.params.id);
    if (!grade) return res.status(404).json({ message: 'Grade not found' });

    res.status(200).json({ message: 'Grade deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting grade', error: err.message });
  }
};
