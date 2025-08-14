///import LoginPage from './pages/LoginPage';
//import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import Home from './pages/Home';

import StudentsPage from './pages/StudentsPage';
//import { useLocation } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import ClassesPage from './pages/ClassesPage';
import TeachersPage from './pages/teachersPage';
import SubjectsPage from './pages/SubjectPage';
import AssessmentPage from './pages/AssessmentPage';
import AttendancePage from './pages/AttendancePage';
import ErrorPage from './pages/ErrorPage';
function App() {
  // const location = useLocation();
  // const isLoginPage = location.pathname.includes('/login');
  return (
  
   
  <Routes>
  <Route exact path='/login' element={<LoginPage/>} />
<Route element={<PrivateRoute />}>
 <Route exact path='/' element={<Home/>} />
  <Route path='/students' element={<StudentsPage />} />
  <Route path='/classes' element={<ClassesPage/>}/>
  <Route path='/teachers' element={<TeachersPage/>}/>
  <Route path = '/subjects' element={<SubjectsPage/>}/>
  <Route path='/assessment' element = {<AssessmentPage />}/>
  <Route path='/attendance' element={<AttendancePage/>}/>
    <Route path="*" element={<ErrorPage />} />
</Route>


</Routes>


  

  );
}

export default App;
