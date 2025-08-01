import { Link } from 'react-router-dom';
import { FaUserGraduate, FaTachometerAlt } from 'react-icons/fa';
import { GiTeacher } from "react-icons/gi";
import { MdMeetingRoom } from "react-icons/md";
import { LiaSchoolSolid } from "react-icons/lia";
import 'bootstrap/dist/css/bootstrap.min.css';
import './compstyle.css';

const Sidebar = () => {
  return (
    <aside className='d-flex flex-column align-items-start'>
      <h2 className='d-flex align-items-center gap-2'>
        <FaTachometerAlt aria-hidden="true" /> Dashboard
      </h2>
      <ul className='side-menus container d-flex flex-column gap-3 list-unstyled mt-5'>
        <li>
          <Link to="/students" className='side-link d-flex align-items-center gap-2'>
            <FaUserGraduate aria-hidden="true" /> Students
          </Link>
        </li>
        <li>
          <Link to="/teachers" className='side-link d-flex align-items-center gap-2'>
            <GiTeacher aria-hidden="true" /> Teachers
          </Link>
        </li>
        <li>
          <Link to="/classes" className='side-link d-flex align-items-center gap-2'>
            <MdMeetingRoom aria-hidden="true" /> Classes
          </Link>
        </li>
        <li>
          <Link to="/subjects" className='side-link d-flex align-items-center gap-2' style={{cursor: "pointer"}}>
            <LiaSchoolSolid aria-hidden="true" /> Subjects
          </Link>
        </li>
      </ul>
    </aside>
  )
}

export default Sidebar;

// import { Link } from 'react-router-dom';
// import { FaUserGraduate, FaTachometerAlt, FaMoneyBill } from 'react-icons/fa';
// import { GiTeacher } from "react-icons/gi";
// import { MdMeetingRoom } from "react-icons/md";
// import { LiaSchoolSolid } from "react-icons/lia";
// import 'bootstrap/dist/css/bootstrap.min.css';
// import './compstyle.css'
// const Sidebar = () => {
//   return (
//     <aside className=' d-flex flex-column align-items-start'>
//       <h2 ><FaTachometerAlt /> Dashboard</h2>
//       <ul className='side-menus container d-flex flex-column gap-3 list-unstyled mt-5 '>
//         <li>
//           <Link  className='side-link'>
//           <FaUserGraduate />  Students
//           </Link>
//         </li>
//          <li>
//           <Link className='side-link'>
//           <GiTeacher /> Teachers
//           </Link>
//         </li>
//          <li>
//           <Link className='side-link'>
//           <MdMeetingRoom /> Classes
//           </Link>
//         </li>
//          <li>
//           <Link className='side-link' style={{cursor: "pointer"}}>
//           <LiaSchoolSolid /> Subjects
//           </Link>
//         </li>
//       </ul>
//     </aside>
//   )
// }

// export default Sidebar
