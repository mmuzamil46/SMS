///import LoginPage from './pages/LoginPage';
//import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import Home from './pages/Home';

import StudentsPage from './pages/StudentsPage';
//import { useLocation } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import ClassesPage from './pages/ClassesPage';
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
</Route>
 

</Routes>


  

  );
}

export default App;
