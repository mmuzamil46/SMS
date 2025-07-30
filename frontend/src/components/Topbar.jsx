import React, { useRef, useState,useEffect,useContext } from 'react'
//import { FaUserAlt } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { IoMdNotifications } from "react-icons/io";
import { useNavigate } from 'react-router-dom';

import { AuthContext } from '../context/AuthContext';

import 'bootstrap/dist/css/bootstrap.min.css';
import './compstyle.css'
const Topbar = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef= useRef(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const {logout} = useContext(AuthContext);
  const handleLogout = () => {
    logout();
    navigate('/login');
  }



  useEffect(()=>{
    const handleClickOutside = (e)=>{
if(dropdownRef.current && !dropdownRef.current.contains(e.target)){
  setShowDropdown(false);
}
    }
    document.addEventListener('mousedown', handleClickOutside);
    return ()=>{
      document.removeEventListener('mousedown', handleClickOutside);
    }
  },[])

  return (
    <div className='topbar container-fluid d-flex justify-content-between align-items-center'>
     <ul className='container d-flex justify-content-between align-items-center list-unstyled'>
      <li><img style={{backgroundColor: "white", borderRadius: "50%",cursor: "pointer"}} src="/images/logo.png" alt="" width={70} height={45} /></li>
     <li>
      <ul className='d-flex justify-content-center align-items-center list-unstyled gap-3'>
         <li >
<Link className='user-icon' style={{color: "#f2bc3e"}}>
<IoMdNotifications  />
</Link>
        </li>
        <li className="position-relative" ref={dropdownRef}>
              <div 
                className="d-flex align-items-center gap-2 user-icon" 
                onClick={() => setShowDropdown(!showDropdown)} 
                style={{ cursor: "pointer", color: "#f2bc3e" }}
              >
                <img 
                  src="http:://localhost:1000/uploads/1753518341618-photo_2025-07-14_14-35-24.jpg" 
                  alt="Profile" 
                  width={30} 
                  height={30} 
                  className="rounded-circle" 
                />
                <span>{user?.username || "User"}</span>
              </div>

              {showDropdown && (
                <div className="dropdown-menu show position-absolute end-0 mt-2 p-2 shadow bg-white border rounded">
                  <Link className="dropdown-item" to="/profile">Profile</Link>
                  <button className="dropdown-item text-danger" onClick={handleLogout}>Logout</button>
                </div>
              )}
            </li>
           {/* <li >
<Link className='user-icon' style={{color: "#f2bc3e"}}>
<FaUserAlt />
</Link>
        </li> */}
      </ul>
     </li>
     </ul>
    </div>
  )
}

export default Topbar