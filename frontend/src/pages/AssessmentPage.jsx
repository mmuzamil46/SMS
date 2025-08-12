import React, { useState, useEffect, useContext } from 'react';
import { Tab, Tabs, Table,Button,Modal, Form } from 'react-bootstrap';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

const AssessmentPage = () => {
  const {user} = useContext(AuthContext);
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [subject, setSubject] = useState(null);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [term,  setTerm] = useState('');
  const [examType, setExamType] = useState('');
  const [outOf, setOutOf] = useState('');

  const [editingGradeId, setEditingGradeId] = useState(null);
  const [editingValue, setEditingValue] = useState('');

 useEffect(() => {
  const fetchTeacherData = async () => {
    try {
    if(!user?._id){
      setError('No logged-in user found');
          setLoading(false);
          return;
    }
      
      

     
      const teacherRes = await api.get(`/teachers/byuser/${user._id}`);
      const teacherData = teacherRes.data;
      setTeacherClasses(teacherData.classes || []);
setSubject(teacherData.subject);
      if (teacherData.classes?.length > 0) {
        setActiveTab(teacherData.classes[0]._id);
      }


      const studentsRes = await api.get('/students');
      setStudents(studentsRes.data);

      
      const gradesRes = await api.get('/grades');
      setGrades(gradesRes.data);

    } catch (err) {
      console.error(err);
      console.log(err);
      
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  fetchTeacherData();
}, []);


  const getStudentsInClass = (classId) => {
    return students.filter(student => 
      student.class && student.class._id === classId
    );
  };

  const getStudentGrades = (studentId) => {
    return grades.filter(grade => 
      grade.student && grade.student._id === studentId
    );
  };

const getExamTypesForClass = (classId) => {
  const classStudentIds = getStudentsInClass(classId).map(s => s._id);
  // Collect grades for those students, sorted by createdAt so order is consistent
  const classGrades = grades
    .filter(g => g.class && g.class._id === classId && classStudentIds.includes(g.student._id))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  // Map them to header objects
  return classGrades.map(g => ({
    examType: g.examType,
    outOf: g.outOf,
    gradeId: g._id,
    subject: g.subject?.name || ''
  }));
};
const getScoreForExamIndex = (studentId, examHeader, index) => {
  // Match by examType, outOf, subject, and createdAt order
  const studentGrades = grades
    .filter(g => g.student && g.student._id === studentId && g.class && g.class._id === activeTab)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const grade = studentGrades[index];
  return grade ? { score: grade.score, gradeId: grade._id } : null;
};
const getScoreForExamType = (studentId, examType) => {
  const grade = grades.find(
    g => g.student && g.student._id === studentId && g.examType === examType
  );
  return grade ? { score: grade.score, gradeId: grade._id } : null;
};
  const handleCreateAssessment = async () => {
    try {
      const studentsInClass = getStudentsInClass(activeTab);

      const payload = studentsInClass.map(stu => ({
        student: stu._id,
        subject: subject, // you may need to set subject based on teacher or tab
        class: activeTab,
        score: 0,
        outOf,
        term,
        examType,
        academicYear: new Date().getFullYear().toString()
      }));

      await api.post('/grades/bulk', payload); // bulk insert endpoint in backend
      const gradesRes = await api.get('/grades');
      setGrades(gradesRes.data);

      setShowModal(false);
      setTerm('');
      setExamType('');
      setOutOf('');
    } catch (err) {
      console.log(err);
      
      console.error('Error creating assessment', err);
    }
  };

  const handleGradeClick = (grade) => {
    setEditingGradeId(grade._id);
    setEditingValue(grade.score);
  };

  const handleGradeKeyDown = async (e, grade) => {
    if (e.key === 'Enter') {
      try {
        await api.put(`/grades/${grade._id}`, { score: Number(editingValue) });
        const updated = grades.map(g => 
          g._id === grade._id ? { ...g, score: Number(editingValue) } : g
        );
        setGrades(updated);
        setEditingGradeId(null);
      } catch (err) {
        console.error('Error updating grade', err);
      }
    }
  };
  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
let examHeaders   = getExamTypesForClass(activeTab);
  return (
     <div className="container-fluid pt-3">
      <h2 className="mb-4">Student Assessments</h2>

      {teacherClasses.length > 0 ? (
        <>
          <Button 
            variant="primary" 
            className="mb-3" 
            onClick={() => setShowModal(true)}
          >
            Create Assessment
          </Button>

          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-3"
          >
            {teacherClasses.map(cls => (
              <Tab 
                key={cls._id} 
                eventKey={cls._id} 
                title={`${cls.name}${cls.section}`}
              >
                
                <div className="mt-3">
                
                  <Table striped bordered hover responsive>
                    
                  <thead>
    <tr>
      <th>Student ID</th>
      <th>Name</th>
      {examHeaders.map((eh, idx) => (
        <th key={idx}>
          {eh.examType} ({eh.outOf})
        </th>
      ))}
    </tr>
  </thead>
  <tbody>
    {getStudentsInClass(cls._id).length > 0 ? (
      getStudentsInClass(cls._id).map(student => (
        <tr key={student._id}>
          <td>{student.studentId}</td>
          <td>{student.fullName}</td>
          {examHeaders.map((eh, idx) => {
            const gradeData = getScoreForExamIndex(student._id, eh, idx);
            if (gradeData) {
              return (
                <td
                  key={idx}
                  onClick={() => handleGradeClick({ _id: gradeData.gradeId, score: gradeData.score })}
                >
                  {editingGradeId === gradeData.gradeId ? (
                    <input
                      type="number"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onKeyDown={(e) => handleGradeKeyDown(e, { _id: gradeData.gradeId })}
                      autoFocus
                    />
                  ) : (
                    gradeData.score
                  )}
                </td>
              );
            } else {
              return <td key={idx} className="text-muted">—</td>;
            }
          })}
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan={2 + examHeaders.length} className="text-center">
          No students in this class
        </td>
      </tr>
    )}
  </tbody>
                  </Table>
                </div>
              </Tab>
            ))}
          </Tabs>

          {/* Modal for creating assessment */}
          <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Create Assessment</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group>
                  <Form.Label>Term</Form.Label>
                  <Form.Control 
                    type="text"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Exam Type</Form.Label>
                  <Form.Control 
                    type="text"
                    value={examType}
                    onChange={(e) => setExamType(e.target.value)}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Out Of</Form.Label>
                  <Form.Control 
                    type="number"
                    value={outOf}
                    onChange={(e) => setOutOf(e.target.value)}
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleCreateAssessment}>
                Create
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      ) : (
        <div className="alert alert-info">
          You are not assigned to any classes.
        </div>
      )}
    </div>
  );
};

export default AssessmentPage;