import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import api from '../services/api';
import { ToastContainer, toast } from 'react-toastify';

const TeachersPage = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const initialFormData = {
        name: '',
        subject: '',
        classes: '',
        phone: '',
        qualification: '',
        teachingSince: ''
    };

    const [formData, setFormData] = useState(initialFormData);
    const [photo, setPhoto] = useState(null);

    const handleView = (teacher) => {
        setSelectedTeacher(teacher);
        setShowViewModal(true);
    };

    const handleDeactive = async (teacher) => {
        try {
            await api.delete(`/teachers/${teacher._id}`);
            const res = await api.get('/teachers');
            setTeachers(res.data);
            toast.success('Teacher deactivated successfully');
        } catch (error) {
            toast.error(`Deactivation failed: ${error.response?.data?.message}`);
        }
    };

    const handleEdit = (teacher) => {
        setEditingTeacher(teacher);
        setFormData({
            name: teacher.fullName || '',
            subject: teacher.subject?.name || '',
            classes: teacher.classes?.map(c => c._id).join(',') || '',
            phone: teacher.phone || '',
            qualification: teacher.qualification || '',
            teachingSince: teacher.teachingSince?.split('T')[0] || ''
        });
        setShowEditModal(true);
    };

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const res = await api.get('/teachers');
                setTeachers(res.data);
            } catch (error) {
                setError('Failed to load teachers');
            } finally {
                setLoading(false);
            }
        };
        fetchTeachers();
    }, []);

    const formatDate = (dateString) => {
        const d = new Date(dateString);
        return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhotoChange = (e) => {
        setPhoto(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach((key) => {
            data.append(key, formData[key]);
        });
        if (photo) data.append("photo", photo);
        
        try {
            const response = await api.post("/teachers", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setShowModal(false);
            setFormData(initialFormData);
            toast.success('Teacher created successfully');
            const { username, password } = response.data.credentials;
            alert(`
              username: ${username}
              \n
              password: ${password}`);
            const res = await api.get('/teachers');
            setTeachers(res.data);
        } catch (error) {
            console.log(error);
            
            alert("Error creating teacher");
        }
    };

    const handleUpdateTeacher = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', formData.name);
        data.append('subject', formData.subject);
        data.append('classes', formData.classes);
        data.append('phone', formData.phone);
        data.append('qualification', formData.qualification);
        data.append('teachingSince', formData.teachingSince);

        if (photo instanceof File) {
            data.append('photo', photo);
        }

        try {
            console.log(data);
            
            await api.put(`/teachers/${editingTeacher._id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Teacher updated successfully!');
            setShowEditModal(false);
            setFormData(initialFormData);
            const res = await api.get('/teachers');
            setTeachers(res.data);
        } catch (err) {
            toast.error(`Update failed: ${err.response?.data?.message}`);
        }
    };

    return (
        <div className=''>
            <ToastContainer />
            <h2 className='mb-4'>Teachers</h2>
            <button
                className="btn btn-primary mb-3"
                onClick={() => setShowModal(true)}
            >
                ➕ Add Teacher
            </button>
            {loading && <p>Loading...</p>}
            {error && <div className='alert alert-danger'>{error}</div>}

            {!loading && !error && (
                <div className="table-responsive">
                    <table className="table table-bordered table-striped">
                        <thead className="thead-dark">
                            <tr>
                                <th>Teacher ID</th>
                                <th>Name</th>
                                <th>Subject</th>
                                <th>Classes</th>
                                <th>Phone</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teachers.map((teacher) => (
                                <tr key={teacher._id}>
                                    <td>{teacher.teacherId}</td>
                                    <td>{teacher.fullName}</td>
                                    <td>{teacher.subject?.name}</td>
                                    <td>
                                        {teacher.classes?.map(c => `${c.name}${c.section}`).join(', ')}
                                    </td>
                                    <td>{teacher.phone}</td>
                                    <td>
                                        <button className="btn btn-sm btn-info mx-1"
                                            onClick={() => handleView(teacher)}
                                        >View</button>
                                        <button className="btn btn-sm btn-warning mx-1"
                                            onClick={() => handleEdit(teacher)}
                                        >Edit</button>
                                        <button className="btn btn-sm btn-danger mx-1"
                                            onClick={() => handleDeactive(teacher)}
                                        >Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {teachers.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center">
                                        No teachers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Teacher Modal */}
            {showModal && (
                <div className="modal show d-block" tabIndex="-1" role="dialog">
                    <div className="modal-dialog modal-lg" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add Teacher</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowModal(false)}
                                ></button>
                            </div>

                            <div className="modal-body">
                                <form onSubmit={handleSubmit} encType="multipart/form-data">
                                    <div className="row">
                                        <div className="col-md-6 mb-2">
                                            <label>Full Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6 mb-2">
                                            <label>Subject</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6 mb-2">
                                            <label>Classes (comma separated IDs)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="classes"
                                                value={formData.classes}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="col-md-6 mb-2">
                                            <label>Phone</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="col-md-6 mb-2">
                                            <label>Qualification</label>
                                            <select
                                                className="form-control"
                                                name="qualification"
                                                value={formData.qualification}
                                                onChange={handleChange}
                                            >
                                                <option value="">Select</option>
                                                <option value="BA">BA</option>
                                                <option value="BSc">BSc</option>
                                                <option value="MA">MA</option>
                                                <option value="MSc">MSc</option>
                                                <option value="PhD">PhD</option>
                                            </select>
                                        </div>

                                        <div className="col-md-6 mb-2">
                                            <label>Teaching Since</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                name="teachingSince"
                                                value={formData.teachingSince}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

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
                                        Save Teacher
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Teacher Modal */}
            {showViewModal && selectedTeacher && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Teacher Details</h5>
                                <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p><strong>Name:</strong> {selectedTeacher.fullName}</p>
                                <p><strong>Teacher ID:</strong> {selectedTeacher.teacherId}</p>
                                <p><strong>Subject:</strong> {selectedTeacher.subject?.name}</p>
                                <p><strong>Classes:</strong> {selectedTeacher.classes?.map(c => `${c.name}${c.section}`).join(', ')}</p>
                                <p><strong>Phone:</strong> {selectedTeacher.phone}</p>
                                <p><strong>Qualification:</strong> {selectedTeacher.qualification}</p>
                                <p><strong>Teaching Since:</strong> {formatDate(selectedTeacher.teachingSince)}</p>
                                {selectedTeacher.photo && <img src={`http://localhost:1000/uploads/${selectedTeacher.photo}`} alt="teacher" width="100" />}
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowViewModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Teacher Modal */}
            {showEditModal && editingTeacher && (
                <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Teacher</h5>
                                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
                            </div>

                            <form onSubmit={handleUpdateTeacher}>
                                <div className="modal-body row g-3">
                                    <div className="col-md-6 mb-2">
                                        <label>Full Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6 mb-2">
                                        <label>Subject</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="col-md-6 mb-2">
                                        <label>Classes (comma separated IDs)</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="classes"
                                            value={formData.classes}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="col-md-6 mb-2">
                                        <label>Phone</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="col-md-6 mb-2">
                                        <label>Qualification</label>
                                        <select
                                            className="form-control"
                                            name="qualification"
                                            value={formData.qualification}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select</option>
                                            <option value="BA">BA</option>
                                            <option value="BSc">BSc</option>
                                            <option value="MA">MA</option>
                                            <option value="MSc">MSc</option>
                                            <option value="PhD">PhD</option>
                                        </select>
                                    </div>

                                    <div className="col-md-6 mb-2">
                                        <label>Teaching Since</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            name="teachingSince"
                                            value={formData.teachingSince}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label>Change Photo</label>
                                        <input type="file" className="form-control" onChange={handlePhotoChange} />
                                        {editingTeacher.photo && (
                                            <img src={`http://localhost:1000/uploads/${editingTeacher.photo}`} alt="current" width={60} className="mt-2 rounded" />
                                        )}
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Update Teacher</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeachersPage;