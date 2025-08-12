const Teacher = require('../models/teacher');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const Subject = require('../models/subject');
const {generateUsername, generatePwd} = require('../utils/userpwdGenerator');

const genarteTeacherId = async () => {
    const count = await Teacher.countDocuments();
    const year = new Date().getFullYear().toString().slice(-2);
    const serial = String(count + 1).padStart(3, '0');
    return `TEA${serial}/${year}`;
}

exports.createTeacher = async (req , res) => {
    try {
      //console.log(req.body);
      
        const {name, subject,classes, phone, qualification,teachingSince} = req.body
        const fname = name.split(' ')
        const username = await generateUsername(fname[0], fname[1]);
        const password = await generatePwd();
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
          username, 
          password:hashedPassword, 
          role:'teacher'
        });
        const teacherId =  await genarteTeacherId();
        const subjectDoc = await Subject.findOne({name:subject});
const photo = req.file ? req.file.filename : null;
        const teacher = await Teacher.create({
            user:user._id,
            teacherId,
            fullName:name,
            subject:subjectDoc._id || '',
            photo,
            phone,
            qualification,
            teachingSince
        });
        res.status(200).json({message:'teacher created',credentials:{username,password},teacher});
    } catch (error) {
      console.log(error);
      
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

// exports.updateTeacher = async (req, res) => {
//   try {
//     const updatedTeacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true })
//       .populate('user', '-password')
//       .populate('subject')
//       .populate('classes');

//     if (!updatedTeacher) return res.status(404).json({ message: 'Teacher not found' });

//     res.status(200).json(updatedTeacher);
//   } catch (err) {
//     res.status(500).json({ message: 'Error updating teacher', error: err.message });
//   }
// }
exports.updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const  teacher = await Teacher.findById(id);


    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    teacher.fullName = req.body.name || teacher.fullName;
    teacher.phone = req.body.phone || teacher.phone;
    teacher.qualification = req.body.qualification || teacher.qualification;
    teacher.teachingSince = req.body.teachingSince || teacher.teachingSince;
   
    // Handle subject update if provided (convert name to ObjectId if needed)
    if (req.body.subject) {
   
       const subjectDoc = await Subject.findOne({ _id: req.body.subject });
        if (!subjectDoc) {
          return res.status(400).json({ message: 'Subject not found' });
        }
        teacher.subject = subjectDoc._id;
      }
    
 if (req.body.classes) {
      teacher.classes = req.body.classes.split(',').map(id => id.trim());
    }
   
    teacher.photo = req.file? `/uploads/${req.file.filename}`: teacher.photo;
     await teacher.save();

    res.status(200).json({
      success: true,
      message: 'Teacher updated successfully',
      teacher: teacher
    });

  } catch (err) {
    console.error('Error updating teacher:', err);
    console.log(err);
    
    res.status(500).json({ 
      success: false,
      message: 'Error updating teacher',
      error: err.message 
    });
  }
};

exports.getTeacherByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
console.log(userId);

    const teacher = await Teacher.findOne({ user: userId })
      .populate('user', '-password')
      .populate('subject')
      .populate('classes');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found for this user ID' });
    }

    res.status(200).json(teacher);
  } catch (err) {
    console.log(err);
    
    res.status(500).json({
      message: 'Error fetching teacher by user ID',
      error: err.message
    });
  }
};


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
