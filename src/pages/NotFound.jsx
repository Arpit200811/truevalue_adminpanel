import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="vh-100 d-flex flex-column justify-content-center align-items-center bg-white p-4">
      <div className="text-center">
         <div className="mb-4 d-inline-block bg-danger bg-opacity-10 p-4 rounded-circle">
            <FaExclamationTriangle className="text-danger" size={60} />
         </div>
         <h1 className="fw-black text-dark mb-1" style={{ fontSize: '3.5rem', letterSpacing: '-2px' }}>NODE NOT FOUND</h1>
         <p className="text-muted mb-5 fw-medium">ERROR_CODE: 404_CLUSTER_MISMATCH<br/>The requesting resource is not mapped in the current Super-App taxonomy.</p>
         
         <div className="d-flex gap-3 justify-content-center">
            <Link to="/dashboard" className="btn btn-success px-4 py-2 rounded-pill fw-bold shadow-sm d-flex align-items-center gap-2">
               <FaArrowLeft /> Retrace to Command Center
            </Link>
         </div>
      </div>
      
      <div className="position-absolute bottom-0 mb-5 text-muted x-small fw-bold opacity-25">
         CLOUDE_ADMIN_V2.0 // SYSTEM_AUTH_ACTIVE
      </div>

      <style>{`
        .fw-black { font-weight: 900; }
        .x-small { font-size: 0.7rem; }
      `}</style>
    </div>
  );
};

export default NotFound;
