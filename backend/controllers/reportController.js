const Grade = require('../models/grade');
const Student = require('../models/student');
const Class = require('../models/class');
const Subject = require('../models/subject');

exports.getStudentReportCard = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { term, academicYear } = req.query;

    if (!term || !academicYear) {
      return res.status(400).json({ message: 'term and academicYear are required' });
    }

    // Get student details
    const student = await Student.findById(studentId)
      .populate('user')
      .populate('class');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Fetch grades
    const grades = await Grade.find({
      student: studentId,
      term,
      academicYear
    }).populate('subject');

    if (grades.length === 0) {
      return res.status(404).json({ message: 'No grades found for this term/year' });
    }

    // Calculate average
    const total = grades.reduce((sum, g) => sum + g.score, 0);
    const average = (total / grades.length).toFixed(2);

    // Build report
    const report = {
      student: {
        studentId: student.studentId,
        name: student.user?.name || 'N/A',
        class: `${student.class?.name}${student.class?.section}` || 'N/A',
      },
      academicYear,
      term,
      subjects: grades.map(g => ({
        subject: g.subject.name,
        score: g.score
      })),
      averageScore: Number(average),
      remarks: getRemarks(Number(average))
    };

    res.json(report);

  } catch (err) {
    res.status(500).json({ message: 'Error building report card', error: err.message });
  }
};

// Helper: Generate remark
function getRemarks(avg) {
  if (avg >= 90) return 'Excellent';
  if (avg >= 75) return 'Very Good';
  if (avg >= 60) return 'Good';
  if (avg >= 50) return 'Needs Improvement';
  return 'Poor';
}


exports.getStudentSubjectPerformance = async (req, res) => {
  try {
    const { studentId, subjectId } = req.params;
    let { academicYear } = req.query;

    // Default to current academic year if not given
    if (!academicYear) {
      const now = new Date();
      const y1 = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
      const y2 = y1 + 1;
      academicYear = `${y1}/${y2}`;
    }

    const student = await Student.findById(studentId).populate('user');
    const subject = await Subject.findById(subjectId);
    if (!student || !subject) {
      return res.status(404).json({ message: 'Student or Subject not found' });
    }

    const grades = await Grade.find({
      student: studentId,
      subject: subjectId,
      academicYear
    }).sort({ term: 1, createdAt: 1 });

    if (grades.length === 0) {
      return res.status(404).json({ message: 'No grades found for this subject' });
    }

    // Group grades by academicYear + term
    const performance = {};
    let total = 0;

    for (const grade of grades) {
      const key = `${grade.academicYear} - ${grade.term}`;
      if (!performance[key]) performance[key] = [];

      performance[key].push({
        examType: grade.examType,
        score: grade.score,
        date: grade.createdAt
      });

      total += grade.score;
    }

    //const average = (total / grades.length).toFixed(2);

    res.status(200).json({
      student: {
        id: student.studentId,
        name: student.user?.name || 'N/A',
      },
      subject: subject.name,
      academicYear,
      totalRecords: grades.length,
      totalScore: total,
      performance
    });

  } catch (err) {
    res.status(500).json({ message: 'Error generating subject report', error: err.message });
  }
};