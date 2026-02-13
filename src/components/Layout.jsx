import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  const [showSidebar, setShowSidebar] = useState(false);

  const toggleSidebar = () => setShowSidebar(!showSidebar);

  return (
    <div className="layout-wrapper d-flex min-vh-100">
      {/* Overlay for mobile */}
      {showSidebar && (
        <div 
          className="sidebar-overlay d-md-none" 
          onClick={() => setShowSidebar(false)}
        ></div>
      )}

      {/* Sidebar with visibility control */}
      <div className={`sidebar-container ${showSidebar ? 'show' : ''}`}>
        <Sidebar closeSidebar={() => setShowSidebar(false)} />
      </div>

      <div className="flex-grow-1 d-flex flex-column main-content-wrapper">
        <Topbar toggleSidebar={toggleSidebar} />
        <main className="dashboard-content p-3 p-md-4">
          <Outlet />
        </main>
      </div>

      <style>{`
        .layout-wrapper {
          overflow-x: hidden;
        }

        .sidebar-container {
          position: fixed;
          top: 0;
          left: -280px;
          height: 100vh;
          width: 270px;
          z-index: 1050;
          transition: transform 0.3s ease-in-out;
          background: white;
        }

        .sidebar-container.show {
          transform: translateX(280px);
          box-shadow: 10px 0 20px rgba(0,0,0,0.05);
        }

        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0,0,0,0.4);
          z-index: 1045;
          backdrop-filter: blur(2px);
        }

        .main-content-wrapper {
          width: 100%;
          min-width: 0;
        }

        @media (min-width: 768px) {
          .sidebar-container {
            position: sticky;
            left: 0;
            transform: none !important;
          }
          .sidebar-overlay {
            display: none;
          }
          .main-content-wrapper {
            width: calc(100% - 270px);
          }
        }

        /* Global Responsive Tweaks */
        @media (max-width: 576px) {
          .dashboard-content {
            padding: 15px !important;
          }
          .card {
            border-radius: 15px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;
