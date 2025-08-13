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

  const [term,  setTerm] = useState('Term 1');
  const [examType, setExamType] = useState('Quiz');
  const [outOf, setOutOf] = useState('');
 
  const [remainingOutOf, setRemainingOutOf] = useState(100);

  const [editingGradeId, setEditingGradeId] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [termFilter, setTermFilter] = useState('Term 1');


useEffect(()=>{
  if (!subject?._id) return;
  if(term && activeTab){
    const totalSoFar = grades.filter(g => g.class && g.class._id === activeTab && g.term.toLowerCase() === term.toLowerCase() &&
     g.subject && g.subject._id === subject?._id)
      .reduce((sum, g) => sum + (g.outOf || 0), 0);
    setRemainingOutOf(Math.max(0, 100 - totalSoFar));
  }
},[term, activeTab, grades,subject])

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
 
const classGrades = grades
  .filter(g =>
    g.class && g.class._id === classId &&
    classStudentIds.includes(g.student._id) &&
    g.term.toLowerCase() === termFilter.toLowerCase() && 
    g.subject && g.subject._id === subject?._id
  )
  .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));


 
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
  .filter(g =>
    g.student && g.student._id === studentId &&
    g.class && g.class._id === activeTab &&
    g.term.toLowerCase() === termFilter.toLowerCase() &&
     g.subject && g.subject._id === subject?._id 
  )
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
       if (!outOf || outOf <= 0) {
      alert('Please enter a valid Out Of value');
      return;
    }
    if (outOf > remainingOutOf) {
      alert(`Out Of cannot exceed remaining ${remainingOutOf} for ${term}`);
      return;
    }
      const studentsInClass = getStudentsInClass(activeTab);

      const payload = studentsInClass.map(stu => ({
        student: stu._id,
        subject: subject._id, // you may need to set subject based on teacher or tab
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
    setTerm('Term 1');
    setExamType('Quiz');
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
      const newScore = Number(editingValue);

   
    if (newScore < 0 || newScore > grade.outOf) {
      alert(`Score must be between 0 and ${grade.outOf}`);
      return;
    }
      try {
        await api.put(`/grades/${grade._id}`, { score: newScore });
        const updated = grades.map(g => 
          g._id === grade._id ? { ...g, score: newScore } : g
        );
        setGrades(updated);
        setEditingGradeId(null);
      } catch (err) {
        console.error('Error updating grade', err);
      }
    }
  };
  const getTotalScoreForStudent = (studentId, classId) => {
return grades
  .filter(g =>
    g.student && g.student._id === studentId &&
    g.class && g.class._id === classId &&
    g.term.toLowerCase() === termFilter.toLowerCase() &&
    g.subject && g.subject._id === subject?._id
  )
  .reduce((sum, g) => sum + (g.score || 0), 0);

};
  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
let examHeaders   = subject?._id ? getExamTypesForClass(activeTab) : [];
  return (
     <div className="container-fluid pt-3">
   
<div className="d-flex justify-content-between align-items-center mb-3">
  <h2>Student Assessments</h2>
  <div className="text-end">
    <div><strong>Academic Year:</strong> {grades.find(g => g.class && g.class._id === activeTab)?.academicYear || new Date().getFullYear()}</div>
    <div><strong>Subject:</strong> { subject.name || 'N/A'}</div>
      <div className="mt-2">
    <Form.Select
      size="sm"
      style={{ width: '150px', display: 'inline-block' }}
      value={termFilter}
      onChange={(e) => setTermFilter(e.target.value)}
    >
      <option value="Term 1">Term 1</option>
      <option value="Term 2">Term 2</option>
    </Form.Select>
  </div>
  </div>
</div>
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
      <th>Total (100%)</th>
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
                      max={eh.outOf}
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onKeyDown={(e) => handleGradeKeyDown(e, { _id: gradeData.gradeId , outOf: eh.outOf})}
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
          <td><strong>{getTotalScoreForStudent(student._id, cls._id)}</strong></td>
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
                <Form.Group className="mb-3">
    <Form.Label>Term</Form.Label>
    <Form.Select value={term} onChange={(e) => setTerm(e.target.value)}>
      <option value="Term 1">Term 1</option>
      <option value="Term 2">Term 2</option>
    </Form.Select>
  </Form.Group>

  <Form.Group className="mb-3">
    <Form.Label>Exam Type</Form.Label>
    <Form.Select value={examType} onChange={(e) => setExamType(e.target.value)}>
      <option value="Quiz">Quiz</option>
      <option value="Mid-exam">Mid-exam</option>
      <option value="Assignment">Assignment</option>
      <option value="Final">Final</option>
    </Form.Select>
  </Form.Group>

  <Form.Group className="mb-3">
    <Form.Label>
      Out Of (Max Remaining: {remainingOutOf})
    </Form.Label>
    <Form.Control
      type="number"
      value={outOf}
      min="1"
      max={remainingOutOf}
      onChange={(e) => {
        const val = Number(e.target.value);
        if (val <= remainingOutOf) {
          setOutOf(val);
        }
      }}
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