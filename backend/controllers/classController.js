const Class = require('../models/class');



exports.createClass = async (req, res) => {
    try {
        
        const {name , section,  homeRoomTeacher} = req.body;

        const newClass = await Class.create({
            name,
            section,
            homeRoomTeacher
        });
        res.status(201).json({message: 'class created', class: newClass});

    } catch (error) {
        res.status(500).json({message : 'Error creating class', error:error.message})
    }
}
// controllers/classController.js
exports.getAllClasses = async (req, res) => {
  try {
    const classes = await Class.aggregate([
      {
        $lookup: {
          from: "teachers",
          localField: "homeRoomTeacher",
          foreignField: "_id",
          as: "teacher"
        }
      },
      { $unwind: { path: "$teacher", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "students",
         let: { classId: "$_id" },
          pipeline: [
            {$match:{$expr:{$eq:["$class", "$$classId"]}}},
            {$match:{isActive: true}}
          ],
          as: "students"
        }
      },
      {
        $project: {
          name: 1,
          section: 1,
          studentCount: { $size: "$students" },
          homeRoomTeacher: "$teacher.user"
        }
      }
    ]);
    res.status(200).json(classes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching classes", error: err.message });
  }
};


// exports.getAllClasses = async (req , res) => {
//     try {
//         const classes = await Class.find().populate('homeRoomTeacher')
//         res.status(200).json(classes);
    
//     } catch (error) {
//          res.status(500).json({message : 'Error fetching class', error:error.message})
//     }
// }

exports.getClassById = async (req, res) => {
    try {
        const oneClass = await  Class.findOne(req.params.id).populate('homeRoomTeacher');
        if(!oneClass)
            return res.status(404).json({message:'class not found'});
        res.status(200).json(oneClass);
    } catch (error) {
         res.status(500).json({message : 'Error fetching class', error:error.message})
    }
}

exports.updateClass = async (req, res)=>{

    try {
        const updatedClass = await Class.findByIdAndUpdate(req.params.id, req,body,{new:true})
        if(!updatedClass) 
            return res.status(404).json({message: 'class not found'});

        res.status(200).json(updatedClass);
    } catch (error) {
         res.status(500).json({message : 'Error updating class', error:error.message})
    }
}

exports.deleteClass = async (req, res) => {
    try {
        const deleted = await Class.findByIdAndDelete(req.params.id);
        if(!deleted)
            return res.status(404).json({message:'class not found'})

        res.status(200).json({message:'class deleted'})
    } catch (error) {
         res.status(500).json({message : 'Error deleting class', error:error.message})
    }
}


// exports.getClassesWithStudentCount = async (req, res) => {
//   try {
//     const classes = await Class.aggregate([
//       {
//         $lookup: {
//           from: "students",
//           localField: "_id",
//           foreignField: "class",
//           as: "students"
//         }
//       },
//       {
//         $project: {
//           name: 1,
//           section: 1,
//           studentCount: { $size: "$students" }
//         }
//       },
//       { $sort: { name: 1, section: 1 } }
//     ]);

//     res.status(200).json(classes);
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching classes", error: err.message });
//   }
// };
