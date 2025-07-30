const Teacher = require('../models/teacher');
const User = require('../models/user');
const bcrypt = require('bcryptjs');


const genarteTeacherId = async () => {
    const count = await Teacher.countDocuments();
    const year = new Date().getFullYear().toString().slice(-2);
    const serial = String(count + 1).padStart(3, '0');
    return `TEA${serial}/${year}`;
}

exports.createTeacher = async (req , res) => {
    try {
        const {name, username, email, password, subject, classes, phone, qualification} = req.body

        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message: 'email already exists!!'});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({name, username, email, password:hashedPassword, role:'teacher'});
        const teacherId =  await genarteTeacherId();
const photo = req.file ? req.file.filename : null;
        const teacher = await Teacher.create({
            user:user._id,
            teacherId,
            subject,
            classes,
            photo,
            phone,
            qualification
        });
        res.status(201).json({message:'teacher created',teacher});
    } catch (error) {
        res.status(500).json({message:'error creating teacher',error:error})
    }
}

exports.getAllTeachers = async (req, res) => {
try {
    const teachers = await Teacher.find()
    .populate('user', '-password')
    .populate('subject')
    .populate('classes');

 
    res.status(200).json(teachers);
} catch (error) {
    
}

}

exports.getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('user', '-password')
      .populate('subject')
      .populate('classes');

    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    res.status(200).json(teacher);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching teacher', error: err.message });
  }
}

exports.updateTeacher = async (req, res) => {
  try {
    const updatedTeacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('user', '-password')
      .populate('subject')
      .populate('classes');

    if (!updatedTeacher) return res.status(404).json({ message: 'Teacher not found' });

    res.status(200).json(updatedTeacher);
  } catch (err) {
    res.status(500).json({ message: 'Error updating teacher', error: err.message });
  }
}

exports.deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    await User.findByIdAndDelete(teacher.user);
    await Teacher.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Teacher deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting teacher', error: err.message });
  }
}
