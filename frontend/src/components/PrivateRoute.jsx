// src/components/PrivateRoute.js
import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Topbar from '../components/Topbar';
import Sidebar from '../components/Sidebar';

const PrivateRoute = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  //if (loading) return <div>Loading...</div>; // Optional loading state

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <div className="d-flex">
      <Topbar />
      <div className="d-flex pt-5 flex-grow-1">
        <Sidebar />
        <div className="p-3 flex-grow-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default PrivateRoute;
