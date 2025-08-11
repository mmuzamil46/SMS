import React, { useState, useEffect } from 'react';
import { Tab, Tabs, Table } from 'react-bootstrap';
import api from '../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';

const AssessmentPage = () => {
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        // Get teacher's assigned classes
        const teacherRes = await api.get('/teachers/');
        const teacherData = teacherRes.data;
        setTeacherClasses(teacherData.classes || []);
        
        if (teacherData.classes.length > 0) {
          setActiveTab(teacherData.classes[0]._id);
        }
        
        // Get all students
        const studentsRes = await api.get('/students');
        setStudents(studentsRes.data);
        
        // Get all grades
        const gradesRes = await api.get('/grades');
        setGrades(gradesRes.data);
        
      } catch (err) {
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container-fluid pt-3">
      <h2 className="mb-4">Student Assessments</h2>
      
      {teacherClasses.length > 0 ? (
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
                      <th>Grades</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getStudentsInClass(cls._id).length > 0 ? (
                      getStudentsInClass(cls._id).map(student => {
                        const studentGrades = getStudentGrades(student._id);
                        return (
                          <tr key={student._id}>
                            <td>{student.studentId}</td>
                            <td>{student.fullName}</td>
                            <td>
                              {studentGrades.length > 0 ? (
                                <div>
                                  {studentGrades.map(grade => (
                                    <div key={grade._id}>
                                      {grade.subject?.name}: {grade.score}/{grade.outOf} ({grade.examType})
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-muted">No grades recorded</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center">
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
      ) : (
        <div className="alert alert-info">
          You are not assigned to any classes.
        </div>
      )}
    </div>
  );
};

export default AssessmentPage;