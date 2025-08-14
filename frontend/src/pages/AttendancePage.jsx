import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Form, Tabs, Tab } from 'react-bootstrap';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

const AttendancePage = () => {
  const { user } = useContext(AuthContext);

  const [homeroomClass, setHomeroomClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [monthlyData, setMonthlyData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [summaryFrom, setSummaryFrom] = useState('');
  const [summaryTo, setSummaryTo] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user?._id) {
          setError('No logged-in user found');
          setLoading(false);
          return;
        }

        // 1. Get teacher data
        const teacherRes = await api.get(`/teachers/byuser/${user._id}`);
        const teacherData = teacherRes.data;

        // Assume homeroom class detection
        const homeroomCls = teacherData.classes?.find(c => c.homeroomTeacher?.toString() === teacherData._id) 
                          || teacherData.classes?.[0];
        if (!homeroomCls) {
          setError('You are not assigned as a homeroom teacher to any class.');
          setLoading(false);
          return;
        }
        setHomeroomClass(homeroomCls);

        // 2. Get students for that class
        const studentsRes = await api.get('/students');
        const classStudents = studentsRes.data.filter(s => s.class?._id === homeroomCls._id);
        setStudents(classStudents);

        // 3. Load attendance for today
        await loadAttendance(homeroomCls._id, date);
      } catch (err) {
        console.error(err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const loadAttendance = async (classId, selectedDate) => {
    try {
      const res = await api.get(`/attendance?class=${classId}&date=${selectedDate}`);
      const attMap = {};
      res.data.forEach(record => {
        attMap[record.student._id] = { status: record.status, id: record._id };
      });
      setAttendance(attMap);
    } catch (err) {
      console.error(err);
      setError('Error loading attendance');
    }
  };

  const handleStatusChange = (studentId, value) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status: value }
    }));
  };

  const saveAttendance = async () => {
    try {
      for (const stu of students) {
        const current = attendance[stu._id];
        if (current?.id) {
          await api.put(`/attendance/${current.id}`, { status: current.status });
        } else {
          await api.post('/attendance', {
            student: stu._id,
            class: homeroomClass._id,
            date,
            status: current?.status || 'Present'
          });
        }
      }
      alert('Attendance saved successfully');
      await loadAttendance(homeroomClass._id, date);
    } catch (err) {
      console.error(err);
      alert('Error saving attendance');
    }
  };

  const loadMonthlyData = async () => {
    try {
      const res = await api.get(`/attendance/monthly?classId=${homeroomClass._id}&month=${month}`);
      setMonthlyData(res.data);
    } catch (err) {
      console.error(err);
      alert('Error loading monthly attendance');
    }
  };

  const loadSummaryData = async () => {
    try {
      const res = await api.get(`/attendance/summary?classId=${homeroomClass._id}&fromDate=${summaryFrom}&toDate=${summaryTo}`);
      setSummaryData(res.data.summary);
    } catch (err) {
      console.error(err);
      alert('Error loading summary');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container-fluid pt-3">
      <h2>Attendance Control</h2>
      {homeroomClass && (
        <div className="mb-3">
          <strong>Class: </strong>{homeroomClass.name}{homeroomClass.section}
        </div>
      )}

      <Tabs defaultActiveKey="daily" className="mb-3">
        {/* DAILY ATTENDANCE */}
        <Tab eventKey="daily" title="Daily View">
          <div className="mb-3">
            <Form.Label>Select Date:</Form.Label>
            <Form.Control
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                loadAttendance(homeroomClass._id, e.target.value);
              }}
              style={{ maxWidth: '200px' }}
            />
          </div>

          {students.length > 0 ? (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map(stu => (
                  <tr key={stu._id}>
                    <td>{stu.studentId}</td>
                    <td>{stu.fullName}</td>
                    <td>
                    <Form.Select
  value={attendance[stu._id]?.status || 'Present'}
  onChange={(e) => handleStatusChange(stu._id, e.target.value)}
  style={{
    color:
      (attendance[stu._id]?.status || 'Present') === 'Present' ? '#155724' :
      (attendance[stu._id]?.status || 'Present') === 'Absent' ? '#dc3545' :
      (attendance[stu._id]?.status || 'Present') === 'Late' ? '#fd7e14' :
      (attendance[stu._id]?.status || 'Present') === 'Excused' ? '#007bff' :
      '#000'
  }}
>
  <option value="Present" style={{ color: '#155724' }}>Present</option>
  <option value="Absent" style={{ color: '#dc3545' }}>Absent</option>
  <option value="Late" style={{ color: '#fd7e14' }}>Late</option>
  <option value="Excused" style={{ color: '#007bff' }}>Excused</option>
</Form.Select>

                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="alert alert-info">No students found for your class.</div>
          )}

          <Button variant="primary" onClick={saveAttendance}>
            Save Attendance
          </Button>
        </Tab>

        {/* MONTHLY ATTENDANCE */}
 <Tab eventKey="monthly" title="Monthly View">
  <div className="mb-3 d-flex align-items-end gap-3">
    <Form.Group>
      <Form.Label>Month</Form.Label>
      <Form.Control type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
    </Form.Group>
    <Button onClick={loadMonthlyData}>Load</Button>
  </div>

  {monthlyData && monthlyData.students?.length > 0 && (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Student ID</th>
          <th>Name</th>
          {Object.keys(monthlyData.students[0].attendance)
            .filter(dateKey => {
              const day = new Date(dateKey).getDay();
              return day !== 0 && day !== 6;
            })
            .map(dateKey => {
              const dayNum = String(new Date(dateKey).getDate()).padStart(2, '0');
              return <th key={dateKey}>{dayNum}</th>;
            })}
        </tr>
      </thead>
      <tbody>
        {monthlyData.students.map(stu => (
          <tr key={stu.studentId}>
            <td>{stu.studentId}</td>
            <td>{stu.name || stu.fullName}</td>
            {Object.entries(stu.attendance)
              .filter(([dateKey]) => {
                const day = new Date(dateKey).getDay();
                return day !== 0 && day !== 6;
              })
              .map(([dateKey, status], idx) => {
                let style = {};
                switch (status) {
                  case 'Present':
                    style = { backgroundColor: '#d4edda', color: '#155724' };
                    break;
                  case 'Absent':
                    style = { backgroundColor: '#dc3545', color: '#fff' };
                    break;
                  case 'Late':
                    style = { backgroundColor: '#fd7e14', color: '#000' };
                    break;
                  case 'Excused':
                    style = { backgroundColor: '#007bff', color: '#fff' };
                    break;
                  default:
                    style = {};
                }
                return (
                  <td key={idx} style={style}>
                    {status}
                  </td>
                );
              })}
          </tr>
        ))}
      </tbody>
    </Table>
  )}
</Tab>
        {/* SUMMARY VIEW */}
        <Tab eventKey="summary" title="Summary View">
          <div className="mb-3 d-flex align-items-end gap-3">
            <Form.Group>
              <Form.Label>From</Form.Label>
              <Form.Control type="date" value={summaryFrom} onChange={(e) => setSummaryFrom(e.target.value)} />
            </Form.Group>
            <Form.Group>
              <Form.Label>To</Form.Label>
              <Form.Control type="date" value={summaryTo} onChange={(e) => setSummaryTo(e.target.value)} />
            </Form.Group>
            <Button onClick={loadSummaryData}>Load</Button>
          </div>

          {summaryData && summaryData.length > 0 && (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Late</th>
                  <th>Excused</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {summaryData.map(stu => (
                  <tr key={stu.studentId}>
                    <td>{stu.studentId}</td>
                    <td>{stu.name}</td>
                    <td>{stu.present}</td>
                    <td>{stu.absent}</td>
                    <td>{stu.late}</td>
                    <td>{stu.excused}</td>
                    <td>{stu.total}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Tab>
      </Tabs>
    </div>
  );
};

export default AttendancePage;
