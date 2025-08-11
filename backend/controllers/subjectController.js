const Subject = require('../models/subject');

exports.createSubject = async (req, res) => {
  try {
     const { name,  description, gradeRange, stream } = req.body;

    const existing = await Subject.findOne({ name });
    if (existing) return res.status(400).json({ message: 'Subject already exists' });

  const subject = await Subject.create({
      name,
      description,
      gradeRange,
      stream: stream || 'general'
    });
    res.status(201).json({ message: 'Subject created', subject });
  } catch (err) {
    res.status(500).json({ message: 'Error creating subject', error: err.message });
  }
};

exports.getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.aggregate(
      [
        {
          $addFields : {
            startGrade : { $arrayElemAt:["$gradeRange",0] },
            endGrade: { $arrayElemAt: ["$gradeRange", { $subtract: [{ $size: "$gradeRange" }, 1] }] }

          }
        },
        { $sort: { startGrade: 1, endGrade: 1 } },
        { $project: { startGrade: 0, endGrade: 0 } }
      ]
    );
    res.status(200).json(subjects);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching subjects', error: err.message });
  }
};

exports.getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    res.status(200).json(subject);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching subject', error: err.message });
  }
};

exports.updateSubject = async (req, res) => {
  try {
    const {name, description, gradeRange, stream} = req.body
  const subject = await Subject.findById(req.params.id);

    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    subject.name = name || subject.name;
    subject.description = description || subject.description;
    subject.gradeRange = gradeRange?.length ? gradeRange : subject.gradeRange;
    subject.stream = stream || subject.stream;
    await subject.save();

    res.status(200).json(subject);
  } catch (err) {
    res.status(500).json({ message: 'Error updating subject', error: err.message });
  }
};

exports.deleteSubject = async (req, res) => {
  try {
    const deleted = await Subject.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Subject not found' });

    res.status(200).json({ message: 'Subject deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting subject', error: err.message });
  }
};
