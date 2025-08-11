import React, { useEffect, useState } from 'react';
import api from '../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import { toast, ToastContainer } from 'react-toastify';

const ClassesPage = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({ name: '', section: '', homeRoomTeacher: '' });

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      setClasses(res.data);
    } catch (err) {
      setError('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };
const fetchTeachers = async () => {
    try {
      const res = await api.get('/teachers'); 
      setTeachers(res.data);
    } catch (err) {
      console.error('Failed to fetch teachers');
    }
  };
const handleEdit = (cls) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name,
      section: cls.section,
      homeRoomTeacher: cls.homeRoomTeacher?._id || ''
    });
    setShowModal(true);
  };
const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/classes/${editingClass._id}`, formData);
      toast.success('Class updated successfully');
      setShowModal(false);
      fetchClasses();
    } catch (err) {
      toast.error(`Update failed: ${err.response?.data?.message || err.message}`);
    }
  };
    const getAvailableTeachers = () => {
    const assignedTeachers = classes
      .filter(c => c.homeRoomTeacher && (!editingClass || c._id !== editingClass._id))
      .map(c => c.homeRoomTeacher._id);

    return teachers.filter(t => !assignedTeachers.includes(t._id));
  }
  return (
    <div className='mt-5'>
      <ToastContainer />
      <h2 className="mb-4">📚 Classes</h2>

      {loading && <p>Loading...</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead className="thead-dark">
              <tr>
                <th>Grade</th>
                <th>Section</th>
                <th>Student Count</th>
                <th>Homeroom Teacher</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((cls) => (
                <tr key={cls._id}>
                  <td>{cls.name}</td>
                  <td>{cls.section}</td>
                  <td>{cls.studentCount}</td>
                  <td>{cls.homeRoomTeacher?.fullName || 'none'}</td>
                  <td>
                    <button className="btn btn-info btn-sm mx-1">View</button>
                    <button className="btn btn-warning btn-sm mx-1" onClick={() => handleEdit(cls)}>Edit</button>
                  </td>
                </tr>
              ))}
              {classes.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center">No classes found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {showModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Class</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <label className="form-label">Grade</label>
                  <input type="text" className="form-control mb-2" value={formData.name}
                         onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />

                  <label className="form-label">Section</label>
                  <input type="text" className="form-control mb-2" value={formData.section}
                         onChange={(e) => setFormData({ ...formData, section: e.target.value })} required />

                  <label className="form-label">Homeroom Teacher (ID)</label>
                                    <select className="form-select mb-2" value={formData.homeRoomTeacher}
                          onChange={(e) => setFormData({ ...formData, homeRoomTeacher: e.target.value })}>
                    <option value="">-- Select Teacher --</option>
                    {getAvailableTeachers().map(t => (
                      <option key={t._id} value={t._id}>{t.fullName}</option>
                    ))}
                  </select>

                  </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-success">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassesPage;
