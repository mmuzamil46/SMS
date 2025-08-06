import React, { useEffect, useState } from 'react';
import api from '../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer,toast } from 'react-toastify';

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  // Form state
  const initialForm = { name: '', code: '', description: '', gradeRange: '', stream: 'general' };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => { fetchSubjects(); }, []);

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      setSubjects(res.data);
    } catch (err) {
      setError('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (subject = null) => {
    if (subject) {
      setEditMode(true);
      setEditingSubject(subject);
      setFormData({
        name: subject.name,
        code: subject.code || '',
        description: subject.description || '',
        gradeRange: subject.gradeRange?.join(',') || '',
        stream: subject.stream || 'general'
      });
    } else {
      setEditMode(false);
      setFormData(initialForm);
    }
    setShowModal(true);
  };

  const handleSaveSubject = async (e) => {
    e.preventDefault();
let message = '';
    const payload = {
      ...formData,
      gradeRange: formData.gradeRange.split(',').map(n => parseInt(n.trim()))
    };

    try {
      if (editMode) {
        await api.put(`/subjects/${editingSubject._id}`, payload);
       message = 'Subject Updated successfully';
      } else {
        await api.post('/subjects', payload);
        message = 'Subject created successfully';
      }
      toast.success(message);
      setShowModal(false);
      setFormData(initialForm);
      fetchSubjects();
      
    } catch (err) {
      toast.error(`Save failed: ${err.response?.data?.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    try {
      await api.delete(`/subjects/${id}`);
      toast.success('Subject deleted successfully');
      fetchSubjects();
    } catch (err) {
      toast.error(`Delete failed: ${err.response?.data?.message}`);
    }
  };

  return (
    <div>
         <ToastContainer />
      <h2 className="mb-4">📚 Subjects</h2>
      <button className="btn btn-primary mb-3" onClick={() => handleOpenModal()}>
        ➕ Add Subject
      </button>

      {loading && <p>Loading...</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <table className="table table-bordered table-striped">
          <thead className="thead-dark">
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Grade Range</th>
              <th>Stream</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subj) => (
              <tr key={subj._id}>
                <td>{subj.name}</td>
                <td>{subj.code}</td>
                <td>{subj.gradeRange?.join(' - ')}</td>
                <td>{subj.stream}</td>
                <td>
                  <button className="btn btn-info btn-sm mx-1" onClick={() => handleOpenModal(subj)}>Edit</button>
                  <button className="btn btn-danger btn-sm mx-1" onClick={() => handleDelete(subj._id)}>Delete</button>
                </td>
              </tr>
            ))}
            {subjects.length === 0 && (
              <tr><td colSpan="5" className="text-center">No subjects found</td></tr>
            )}
          </tbody>
        </table>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editMode ? 'Edit Subject' : 'Add Subject'}</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSaveSubject}>
                <div className="modal-body">
                  <label className="form-label">Name</label>
                  <input type="text" className="form-control mb-2" value={formData.name}
                         onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />

                  <label className="form-label">Code</label>
                  <input type="text" className="form-control mb-2" value={formData.code}
                         onChange={(e) => setFormData({ ...formData, code: e.target.value })} />

                  <label className="form-label">Description</label>
                  <textarea className="form-control mb-2" value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>

                  <label className="form-label">Grade Range (comma separated, e.g. 1,2,3,4)</label>
                  <input type="text" className="form-control mb-2" value={formData.gradeRange}
                         onChange={(e) => setFormData({ ...formData, gradeRange: e.target.value })} required />

                  <label className="form-label">Stream</label>
                  <select className="form-select" value={formData.stream}
                          onChange={(e) => setFormData({ ...formData, stream: e.target.value })}>
                    <option value="general">General</option>
                    <option value="natural">Natural</option>
                    <option value="social">Social</option>
                  </select>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-success">{editMode ? 'Update' : 'Save'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SubjectsPage;
