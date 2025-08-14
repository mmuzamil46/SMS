const monogoose = require('mongoose');
const Attendance = require('../models/attendance');
const Student = require('../models/student');
const User = require('../models/user');
const Class = require('../models/class');
exports.markAttendance = async (req, res) => {
  try {
    const { student, class: classId, date, status, reason } = req.body;



  
    const existing = await Attendance.findOne({ student, date });
    if (existing) {
      return res.status(400).json({ message: 'Attendance already marked for this student on this date' });
    }

    const record = await Attendance.create({
      student,
      class: classId,
      date,
      status,
      reason
    });

    res.status(201).json({ message: 'Attendance marked', record });
  } catch (err) {
    res.status(500).json({ message: 'Error marking attendance', error: err.message });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const filters = {};
    if (req.query.class) filters.class = req.query.class;
    if (req.query.student) filters.student = req.query.student;
    if (req.query.date) filters.date = req.query.date;

    const records = await Attendance.find(filters)
      .populate('student')
      .populate('class');

    res.status(200).json(records);
  } catch (err) {
    console.log(err);
    
    res.status(500).json({ message: 'Error fetching attendance', error: err.message });
  }
};

exports.getAttendanceById = async (req, res) => {
  try {
    const record = await Attendance.findById(req.params.id)
      .populate('student')
      .populate('class');

    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.status(200).json(record);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching attendance', error: err.message });
  }
};

exports.updateAttendance = async (req, res) => {
  try {
    const record = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.status(200).json(record);
  } catch (err) {
    res.status(500).json({ message: 'Error updating attendance', error: err.message });
  }
};

exports.deleteAttendance = async (req, res) => {
  try {
    const record = await Attendance.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.status(200).json({ message: 'Attendance deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting attendance', error: err.message });
  }
};



exports.getAttendanceSummary = async (req, res) => {
  try {
    const { classId, fromDate, toDate } = req.query;

    // Build dynamic filter
    const filter = {};
    if (classId) filter.class = classId;
    if (fromDate || toDate) {
      filter.date = {};
      if (fromDate) filter.date.$gte = new Date(fromDate);
      if (toDate) filter.date.$lte = new Date(toDate);
    }

    // Fetch all matching attendance
    const records = await Attendance.find(filter).populate(
        {
    path: 'student',
    populate: {
      path: 'user',
      model: 'User' 
    }
  }
    )


    // Group by student
    const summaryMap = {};

    for (const record of records) {
      const studentId = record.student._id.toString();
      if (!summaryMap[studentId]) {
        summaryMap[studentId] = {
          name: record.student.fullName || 'N/A',
          studentId: record.student.studentId,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          total: 0
        };
      }

      const status = record.status.toLowerCase();
      summaryMap[studentId][status] = (summaryMap[studentId][status] || 0) + 1;
      summaryMap[studentId].total += 1;
    }

    const summary = Object.values(summaryMap);

    res.status(200).json({ summary });
  } catch (err) {
    res.status(500).json({ message: 'Error generating summary', error: err.message });
  }
};

exports.getClassMonthlyAttendance = async (req, res) => {
  try {
    const { classId, month, studentId } = req.query;

    if (!classId || !month) {
      return res.status(400).json({ message: 'classId and month are required (e.g., 2025-07)' });
    }

    const fromDate = new Date(`${month}-01`);
    const toDate = new Date(new Date(fromDate).setMonth(fromDate.getMonth() + 1));

    // Filter students: all in class or specific one
    let studentsQuery = { class: classId };
    if (studentId) {
      studentsQuery.studentId = studentId;
    }

    const students = await Student.find(studentsQuery).populate('user');

    if (students.length === 0) {
      return res.status(404).json({ message: 'No students found for the given filter' });
    }

    // Get attendance
    const studentIds = students.map(s => s._id);
    const records = await Attendance.find({
      class: classId,
      student: { $in: studentIds },
      date: { $gte: fromDate, $lt: toDate }
    }).populate({
      path: 'student',
      populate: { path: 'user' }
    });

    // Build attendance map
    const attendanceMap = {};
    for (const record of records) {
      const sId = record.student._id.toString();
      const dateKey = record.date.toISOString().slice(0, 10);
      if (!attendanceMap[sId]) attendanceMap[sId] = {};
      attendanceMap[sId][dateKey] = record.status;
    }

    // Format daily data
    const result = students.map(student => {
      const sId = student._id.toString();
      const attendance = {};

      for (let d = new Date(fromDate); d < toDate; d.setDate(d.getDate() + 1)) {
        const key = d.toISOString().slice(0, 10);
        attendance[key] = attendanceMap[sId]?.[key] || 'N/A';
      }

      return {
        studentId: student.studentId,
        name: student.fullName || 'N/A',
        attendance
      };
    });

    const classDoc = await Class.findById(classId);

    res.status(200).json({
      class: classDoc?.name || 'Unknown',
      section: classDoc?.section || 'Unknown',
      month,
      students: result
    });

  } catch (err) {
    console.log(err);
    
    res.status(500).json({ message: 'Error building class monthly view', error: err.message });
  }
};
