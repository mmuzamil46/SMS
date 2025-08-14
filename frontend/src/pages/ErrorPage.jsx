import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const ErrorPage = () => {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
      <h1 className="display-1 fw-bold text-danger">404</h1>
      <h2 className="mb-3">Oops! Page Not Found</h2>
      <p className="text-muted text-center mb-4">
        The page you’re looking for doesn’t exist or may have been moved.
      </p>
      <Link to="/" className="btn btn-primary btn-lg">
        Go Back Home
      </Link>
    </div>
  );
};

export default ErrorPage;
