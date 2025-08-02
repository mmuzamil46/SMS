const Student = require('../models/student');
const User = require('../models/user');
const Class = require('../models/class')
const bcrypt = require('bcryptjs');
require('dotenv').config();
const classCapacity = process.env.CLASS_CAPACITY;

const findClass = async (classId) => {
  const existingClass = await Class.find({name: classId}).sort({section: 1});

  for (const classDoc of existingClass) {
    const studentCount = await Student.countDocuments({ class: classDoc._id });
    if(studentCount < parseInt(classCapacity)){
      return classDoc;
    }
  }
  const newSection = existingClass.length === 0 ? 'A':
   String.fromCharCode(existingClass[existingClass.length - 1].section.charCodeAt(0) + 1);

  
 
  return await Class.create({
    name:classId,
    section:newSection,
  });
}
const generateStudentId = async (classDoc) => {
  const { name: grade, section } = classDoc;
  const count = await Student.countDocuments();
  const currentYear = new Date().getFullYear().toString().slice(-2);
  const paddedCount = String(count + 1).padStart(3, '0');
  return `${grade}${section}${paddedCount}/${currentYear}`;
};
const generateUsername = async (firstName, fathersName) => {
  const baseUsername = (
    firstName.charAt(0) + fathersName.replace(/\s+/g, '')
  ).toLowerCase();
let username = baseUsername;
let counter =1;
while(await User.exists({username})){
  username = `${baseUsername}${counter++}`;
}

return username;

}

const generatePwd = async () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
   for(let i=0; i<8; i++){
    password += chars.charAt(Math.floor(Math.random()* chars.length))
   }
   return password;
}

exports.createStudent = async (req , res) => {
  //console.log(req.file);
    try {
        const {
            firstName,
            fathersName,
            gFathersName, 
            classId, 
            dob, 
            gender, 
            address,
            parentName, 
            phone  
          }= req.body;
          
        // console.log(req.body);
        const password = await generatePwd();

        // const classMatch = classId.match(/^(\d+)([A-Za-z])$/);
        // if(!classMatch){
        //   return res.status(400).json({message:'invalid class format Use format like "10A", "1B"'})
        // }
        // console.log("ClassId received:", classId);
// console.log("Regex Match:", classMatch);
        // const grade = classMatch[1]
        // const section = classMatch[2].toUpperCase();
        // const classDoc = await Class.findOne({name:grade, section: section });
        // console.log(classDoc._id);
        
    //       if (!classDoc) {
    //   return res.status(404).json({ message: `Class ${grade}${section} not found` });
    // }
    //         const existingUser = await User.findOne({username});
//console.log(existingUser);

        //  if(existingUser){
        //   return res.status(400).json({message: 'username already exists!!'});

        //  }
         const hashedPassword = await bcrypt.hash(password, 10);
const username = await generateUsername(firstName, fathersName);
         let user = await User.create({
          username,
          password:hashedPassword,
          role: 'student'
         });
         //console.log(user);
         const classDoc = await findClass(classId);
         const studentId = await generateStudentId(classDoc);
         //console.log(studentId);
         //let fullName = `${firstName} ${fathersName} ${gFathersName}`;
const photo = req.file ? `/uploads/${req.file.filename}` : null;
        try {
          const student = await Student.create({
          user: user._id,
          studentId,
          class:classDoc._id,
          fullName:`${firstName} ${fathersName} ${gFathersName}`,
          dob: dob ? new Date(dob) : null,
          photo,
          gender,
          address,
          parentName,
          phone
         });
         res.status(201).json({message:'Student created',credentials:{username, password}, student});
        } catch (error) {
           if (user) await User.findByIdAndDelete(user._id);
           console.log(error);
           
          res.status(500).json({message: 'error creating student', error: error.message});
        } 

    } catch (error) {
     
      console.log(error);
      res.status(500).json({message: 'error creating student', error: error.message})
        
    }
}

exports.getAllStudents = async (req, res)=>{
  try {
    const students = await Student.find({isActive: true}).populate('user', '-password').populate('class')
   const activeStudents = await 
    res.status(200).json(students);

  } catch (error) {
    res.status(500).json({message:'error fetching students',error:error})
  }
}

exports.getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('class');
    if(!student)
      return res.status(404).json({message: 'student not found'});
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({message:'error fetching student', error:error})
  }
}

exports.updateStudent = async (req, res) => {
  // console.log(req.body);
  
try {
  const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
const fullname = `${req.body.firstName} ${req.body.fathersName} ${req.body.gFathersName}`

     student.fullName = fullname || student.fullName;
    student.dob = req.body.dob ? new Date(req.body.dob) : student.dob;
    student.gender = req.body.gender || student.gender;
    student.address = req.body.address || student.address;
    student.parentName = req.body.parentName || student.parentName;
    student.phone = req.body.phone || student.phone;


    if (req.body.classId) {
      const match = req.body.classId.match(/^(\d+)([A-Za-z])$/);
      if (match) {
        const classDoc = await require('../models/class').findOne({ name: match[1], section: match[2].toUpperCase() });
        if (classDoc) student.class = classDoc._id;
      }
    }

    if (req.file) {
      student.photo = `/uploads/${req.file.filename}`;
    }

    await student.save();
    res.status(200).json({ message: 'Student updated successfully', student });

} catch (error) {
  console.error(error);
    res.status(500).json({ message: 'Error updating student', error: error.message });
}

  // try {
  //   const updatedStudent  = await Student.findByIdAndUpdate(req.params.id,req.body,{new:true}).populate('user', '-password'); 
  //     if(!updatedStudent)
  //       return res.status(404).json({message:'student not found'})
  //     res.status(200).json(updatedStudent);
  // } catch (error) {
  //   res.status(500).json({message:'error updating student', error:error})
  // }
}

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if(!student)
      return res.status(404).json({message: 'student not found!!'});
    // await User.findByIdAndDelete(student.user);
    // await Student.findByIdAndDelete(req.params.id);
await User.findByIdAndUpdate(student.user, {isActive: false});
await Student.findByIdAndUpdate(req.params.id, {isActive: false});
    res.status(200).json({message: 'student deactivated successfully'});

  } catch (error) {
    res.status(500).json({message:'error deleting student', error:error})
  }
}