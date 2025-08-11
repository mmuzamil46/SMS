import React,{useEffect, useState} from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
//import axios from '../services/api';
import api from '../services/api';
import { ToastContainer,toast } from 'react-toastify';


const StudentsPage = () => {
    const [students, setStudents] = useState([]);
     const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
const [showViewModal, setShowViewModal] = useState(false);
const [editingStudent, setEditingStudent] = useState(null);
const [showEditModal, setShowEditModal] = useState(false);
 const [searchTerm, setSearchTerm] = useState('');
    const [classFilter, setClassFilter] = useState('all');
    const [availableClasses, setAvailableClasses] = useState([]);
    const initialFormData = {
    firstName:'',
    fathersName:'',
    gFathersName:'', 
    classId:'', 
    dob:'',
    gender:'', 
    address:'',
    parentName:'', 
    phone:''
};
    const [formData, setFormData] = useState(initialFormData);

    const [photo, setPhoto] = useState(null);
const handleView = (student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
};
const handleDeactive = async (student) => {
  try{
await api.delete(`/students/${student._id}`)
const res = await api.get('/students');
setStudents(res.data);
toast.success('student deactivated successfully');
  }catch(error){
toast.error(`Deactivation failed: ${error.response?.data?.message}`);
  }
}

const handleEdit = (student) => {
    setEditingStudent(student);
    const name = student.fullName.split(' ');
    setFormData({
        firstName: name[0] || '',
        fathersName: name[1] || '',
        gFathersName: name[2] || '',
        classId: student.class?.name + student.class?.section || '',
        dob: student.dob?.split('T')[0] || '',
        gender: student.gender || '',
        address: student.address || '',
        parentName: student.parentName || '',
        phone: student.phone || ''
    });
    setShowEditModal(true);
};
const getUniqueClasses = (students) => {
  const classes =  [...new Set(students.map(student => 
    `${student.class?.name}${student.class?.section}`
  ).filter(Boolean))];

  return classes.sort((a, b) => {

    const numA = parseInt(a.match(/\d+/)?.[0] || 0 );
    const numB = parseInt(b.match(/\d+/)?.[0] || 0 );
    if(numA === numB) return a.localeCompare(b);
    return numA - numB;
  });
}
    useEffect(()=>{
     const fetchStudents = async () =>{
           try{
            const res = await api.get('/students');
            setStudents(res.data);
            setFilteredStudents(res.data);


           
                setAvailableClasses(getUniqueClasses(res.data));
        }catch(error){
            setError('Faild to load students')
        }finally{
            setLoading(false)
        }
     }
     fetchStudents();
    },[])
  useEffect(() => {
        let result = students;
        
        // Apply class filter
        if (classFilter !== 'all') {
            result = result.filter(student => 
                `${student.class?.name}${student.class?.section}` === classFilter
            );
        }
        
        // Apply search term filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(student => 
                student.fullName.toLowerCase().includes(term) || 
                student.studentId.toLowerCase().includes(term)
            );
        }
        
        setFilteredStudents(result);
    }, [searchTerm, classFilter, students]);

const formatDate = (dateString) => {
  const d = new Date(dateString);
  return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
};
    const handleChange = (e) =>{
        setFormData({...formData, [e.target.name]:e.target.value})
    }


    const handlePhotoChange = (e) =>{
        setPhoto(e.target.files[0]);
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach((key)=>{
            data.append(key, formData[key]);
        });
        if(photo) data.append("photo", photo);
        try {
            const response = await api.post("/students", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
            setShowModal(false);
            setFormData(initialFormData);
            toast.success('student added successfully');
            const {username, password} = response.data.credentials;
            alert(`
              username: ${username}
              \n
              password: ${password}`)
            const res = await api.get('/students');
            setStudents(res.data);
            setAvailableClasses(getUniqueClasses(res.data));
        } catch (error) {
            alert("error adding student")
        }
    }
const handleUpdateStudent = async (e) => {
    e.preventDefault();

   const data = new FormData();
  data.append('firstName', formData.firstName);
  data.append('fathersName', formData.fathersName);
  data.append('gfathersName', formData.gFathersName);
  data.append('dob', formData.dob);
  data.append('gender', formData.gender);
  data.append('classId', formData.classId);
  data.append('address', formData.address);
  data.append('parentName', formData.parentName);
  data.append('phone', formData.phone);

    if (formData.photo instanceof File) {
    data.append('photo', formData.photo);
  }
    try {
    await api.put(`/students/${editingStudent._id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    toast.success('Student updated successfully!');
    setShowEditModal(false); 
    setFormData(initialFormData);
   const res = await api.get('/students');
    setStudents(res.data);
  } catch (err) {
    toast.error(`Update failed: ${err.response?.data?.message}`);
  
}

  }
  
  return (
    <div className='pt-0'>
      <ToastContainer />
        <h2 className='mb-4'>Students</h2>
   <div className="row mb-4">
                <div className="col-md-6">
                    <div className="input-group">
                        <span className="input-group-text">
                            <i className="bi bi-search"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by name or student ID"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="col-md-4">
                    <select
                        className="form-select"
                        value={classFilter}
                        onChange={(e) => setClassFilter(e.target.value)}
                    >
                        <option value="all">All Classes</option>
                        {availableClasses.map((cls, index) => (
                            <option key={index} value={cls}>{cls}</option>
                        ))}
                    </select>
                </div>
                <div className="col-md-2">
                    <button
                        className="btn btn-primary w-100"
                        onClick={() => setShowModal(true)}
                    >
                        ➕ Add Student
                    </button>
                </div>
            </div>

          
        {loading && <p>Loading...</p>}
        {error && <div className='alert alert-danger'>{error}</div>}

        {!loading && !error && (
           
            <div className="table-responsive">
                
                <table className="table table-bordered table-striped">
                    <thead className="thead-dark">
                        <tr>
                            {/* <th>Photo</th> */}
                            <th>Student ID</th>
                            <th>Name</th>
                            <th>Class</th>
                            <th>Parent</th>
                            <th>Phone</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            
                            filteredStudents.map((student)=>(
                                <tr key={student._id}>
                                  
                                    <td>{student.studentId}</td>
                                    <td>{student.fullName}</td>
                                    
                                    <td>{`${student.class?.name}${student.class?.section}`}</td>
                                    <td>{student.parentName}</td>
                                    <td>{student.phone}</td>
                                    <td>
                                        <button className="btn btn-sm btn-info mx-1"
                                          onClick={() => handleView(student)}
                                        >View</button>
                                        <button className="btn btn-sm btn-warning mx-1"
                                        onClick={() => handleEdit(student)}
                                        >Edit</button>
                                        <button className="btn btn-sm btn-danger mx-1"
                                        onClick={() => handleDeactive(student)}
                                        >Delete</button>
                                    </td>
                                </tr>
                            ))
                        }
                        {students.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center">
                    No students found.
                  </td>
                </tr>
              )}
                    </tbody>
                </table>
            </div>
        )}

{showModal && (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Student</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <div className="modal-body">
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                  <div className="row">
                    {/* Name */}
                    <div className="col-md-6 mb-2">
                      <label>Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                       <div className="col-md-6 mb-2">
                      <label>Father's Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="fathersName"
                        value={formData.fathersName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                       <div className="col-md-6 mb-2">
                      <label>Grandfather's Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="gFathersName"
                        value={formData.gFathersName}
                        onChange={handleChange}
                        required
                      />
                    </div>
    {/* DOB */}
                    <div className="col-md-6 mb-2">
                      <label>Date of Birth</label>
                      <input
                        type="date"
                        className="form-control"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                      />
                    </div>
                      {/* Gender */}
                    <div className="col-md-6 mb-2">
                      <label>Gender</label>
                      <select
                        className="form-control"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                        <div className="col-md-6 mb-2">
                      <label>Grade (e.g., 1A)</label>
                      <input
                        type="text"
                        className="form-control"
                        name="classId"
                        value={formData.classId}
                        onChange={handleChange}
                        required
                      />
                    </div>
                       {/* Parent Name */}
                    <div className="col-md-6 mb-2">
                      <label>Parent Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="parentName"
                        value={formData.parentName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                       {/* Phone */}
                    <div className="col-md-6 mb-2">
                      <label>Phone</label>
                      <input
                        type="text"
                        className="form-control"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                      {/* Address */}
                    <div className="col-md-6 mb-2">
                      <label>Address</label>
                      <input
                        type="text"
                        className="form-control"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                      />
                    </div>
                           {/* Username */}
                    {/* <div className="col-md-6 mb-2">
                      <label>Username</label>
                      <input
                        type="text"
                        className="form-control"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        autoComplete='off'
                        required
                      />
                    </div> */}
                      {/* Password
                    <div className="col-md-6 mb-2">
                      <label>Password</label>
                      <input
                        type="password"
                        className="form-control"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete='off'
                        required
                      />
                    </div> */}
                  
               

                  

                  
        
                  
                    {/* Photo Upload */}
                    <div className="col-md-12 mb-2">
                      <label>Photo</label>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handlePhotoChange}
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-success mt-3">
                    Save Student
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
{showViewModal && selectedStudent && (
  <div className="modal show d-block" tabIndex="-1">
    <div className="modal-dialog">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Student Details</h5>
          <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
        </div>
        <div className="modal-body">
          <p><strong>Name:</strong> {selectedStudent.fullName}</p>
          <p><strong>Date of Birth:</strong> {formatDate(selectedStudent.dob)}</p>
          <p><strong>Student ID:</strong> {selectedStudent.studentId}</p>
          <p><strong>Class:</strong> {selectedStudent.class?.name}{selectedStudent.class?.section}</p>
          <p><strong>Phone:</strong> {selectedStudent.phone}</p>
          {selectedStudent.photo && <img src={`http://localhost:1000${selectedStudent.photo}`}  alt="student" width="100" />}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" style={{backgroundColor: "#033E56",color:"#f2bc3e",fontWeight:"bold"}} onClick={() => setShowViewModal(false)}>Close</button>
        </div>
      </div>
    </div>
  </div>
)}
{showEditModal && editingStudent && (
  <div className="modal show d-block" tabIndex="-1" style={{background: "rgba(0,0,0,0.5)"}}>
    <div className="modal-dialog modal-lg">
      <div className="modal-content">
        {/* Modal Header */}
        <div className="modal-header">
          <h5 className="modal-title">Edit Student</h5>
          <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleUpdateStudent}>
          <div className="modal-body row g-3">

            {/* Name */}
            {/* <div className="col-md-6">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-control" value={formData.fullName}
                     onChange={(e) => setFormData({...formData, fullName: e.target.value})} required />
            </div> */}
 <div className="col-md-6 mb-2">
                      <label>Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        required
                      />
                    </div>
                       <div className="col-md-6 mb-2">
                      <label>Father's Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.fathersName}
                        onChange={(e) => setFormData({...formData, fathersName: e.target.value})}
                        required
                      />
                    </div>
                       <div className="col-md-6 mb-2">
                      <label>Grandfather's Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.gFathersName}
                        onChange={(e) => setFormData({...formData, gFathersName: e.target.value})}
                        required
                      />
                    </div>
            {/* Class */}
            <div className="col-md-3">
              <label className="form-label">Class (e.g. 1A)</label>
              <input type="text" className="form-control" value={formData.classId}
                     onChange={(e) => setFormData({...formData, classId: e.target.value})} required />
            </div>

            {/* DOB */}
            <div className="col-md-3">
              <label className="form-label">Date of Birth</label>
              <input type="date" className="form-control" value={formData.dob}
                     onChange={(e) => setFormData({...formData, dob: e.target.value})} />
            </div>

            {/* Gender */}
            <div className="col-md-3">
              <label className="form-label">Gender</label>
              <select className="form-select" value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            {/* Phone */}
            <div className="col-md-3">
              <label className="form-label">Phone</label>
              <input type="text" className="form-control" value={formData.phone}
                     onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            </div>

            {/* Parent Name */}
            <div className="col-md-6">
              <label className="form-label">Parent Name</label>
              <input type="text" className="form-control" value={formData.parentName}
                     onChange={(e) => setFormData({...formData, parentName: e.target.value})} />
            </div>

            {/* Address */}
            <div className="col-md-6">
              <label className="form-label">Address</label>
              <input type="text" className="form-control" value={formData.address}
                     onChange={(e) => setFormData({...formData, address: e.target.value})} />
            </div>

            {/* Photo Upload */}
            <div className="col-md-6">
              <label className="form-label">Change Photo</label>
              <input type="file" className="form-control" onChange={(e) => setFormData({...formData, photo: e.target.files[0]})} />
              {editingStudent.photo && (
                <img src={`http://localhost:1000${editingStudent.photo}`} alt="current" width={60} className="mt-2 rounded" />
              )}
            </div>

          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Update Student</button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}


    </div>
  )
}

export default StudentsPage