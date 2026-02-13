
import React, { useState, useEffect } from 'react';
import { FaSearch, FaBell, FaUserCircle, FaCog, FaSignOutAlt, FaBars, FaTimes, FaMotorcycle, FaCheckDouble } from 'react-icons/fa';
import { Form, InputGroup, Button, Dropdown } from 'react-bootstrap';
import { DataService } from '../services/dataService';

import { useNavigate } from 'react-router-dom';

const Topbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('ec_admin_user')) || { name: 'Admin' });

  useEffect(() => {
    // Sync user if localStorage changes (optional but good)
    const storedUser = localStorage.getItem('ec_admin_user');
    if (storedUser) setUser(JSON.parse(storedUser));

    const fetchNotifications = async () => {
      const data = await DataService.getNotificationHistory();
      if (Array.isArray(data)) {
        setNotifications(data.slice(0, 5)); // Just first 5
      }
    };
    fetchNotifications();
    
    // Refresh every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="topbar d-flex justify-content-between align-items-center px-3 px-md-4 py-2 bg-white shadow-sm border-bottom">
      {/* Mobile Menu & Search Icon (Small screens) */}
      <div className="d-flex align-items-center gap-2 flex-grow-1">
        <Button 
          variant="light" 
          className="d-md-none border-0 p-2" 
          onClick={toggleSidebar}
        >
          <FaBars size={18} className="text-secondary" />
        </Button>

        <div className="search-group flex-grow-1" style={{ maxWidth: '400px' }}>
          <InputGroup className="border rounded-pill overflow-hidden bg-light search-container">
            <InputGroup.Text className="bg-transparent border-0 pe-1 d-none d-sm-flex">
              <FaSearch className="text-muted small" />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search..."
              className="border-0 bg-transparent shadow-none small search-input"
              style={{ fontSize: '0.85rem' }}
            />
          </InputGroup>
        </div>
      </div>

      {/* Right Side Icons */}
      <div className="d-flex align-items-center gap-3 ms-2">
        <div className="text-muted cursor-pointer hover-text-primary" onClick={() => navigate('/riders')} title="Fleet Management">
           <FaMotorcycle size={20} />
        </div>

        <Dropdown align="end">
          <Dropdown.Toggle as="div" className="position-relative cursor-pointer d-flex align-items-center no-caret">
            <FaBell size={18} className="text-muted" />
            {notifications.length > 0 && (
              <span className="position-absolute translate-middle badge rounded-pill bg-danger" style={{ top: '2px', left: '100%', fontSize: '0.6rem', padding: '0.3em 0.5em' }}>
                {notifications.length}
              </span>
            )}
          </Dropdown.Toggle>

          <Dropdown.Menu className="shadow border-0 rounded-4 p-0 mt-2" style={{ width: '300px' }}>
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
               <h6 className="fw-bold mb-0">Notifications</h6>
               <FaCheckDouble className="text-success cursor-pointer" size={14} title="Mark all read"/>
            </div>
            <div className="notification-scroll" style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {notifications.map((n, i) => (
                <Dropdown.Item key={i} className="p-3 border-bottom wrapper-white-space">
                   <div className="fw-bold small text-dark">{n.title}</div>
                   <div className="text-muted x-small text-truncate-2 mt-1">{n.message}</div>
                   <div className="text-muted xx-small mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                </Dropdown.Item>
              ))}
              {notifications.length === 0 && (
                <div className="p-4 text-center text-muted small">No new alerts.</div>
              )}
            </div>
            <div className="p-2 text-center bg-light rounded-bottom-4">
               <small className="text-success fw-bold cursor-pointer">View All Activity</small>
            </div>
          </Dropdown.Menu>
        </Dropdown>
        
        <div className="d-flex align-items-center gap-2 cursor-pointer border-start ps-3 h-100 py-1" onClick={() => navigate('/profile')}>
          <div className="text-end d-none d-lg-block">
             <div className="fw-bold small lh-1">{user.name}</div>
             <small className="text-muted x-small">Super Admin</small>
          </div>
          <div className="rounded-circle overflow-hidden border profile-img">
             <img
               src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
               alt="profile"
               className="w-100 h-100 object-fit-cover"
             />
          </div>
        </div>
      </div>

      <style>{`
        .topbar {
          height: 65px;
          position: sticky;
          top: 0;
          z-index: 1000;
        }
        .no-caret::after { display: none; }
        .xx-small { font-size: 0.6rem; }
        .text-truncate-2 {
           display: -webkit-box;
           -webkit-line-clamp: 2;
           -webkit-box-orient: vertical;  
           overflow: hidden;
        }
        .wrapper-white-space { white-space: normal !important; }
        .notification-scroll::-webkit-scrollbar { width: 4px; }
        .notification-scroll::-webkit-scrollbar-thumb { background: #eee; border-radius: 10px; }
        .x-small { font-size: 0.7rem; }
        .cursor-pointer { cursor: pointer; }
        .profile-img {
          width: 32px;
          height: 32px;
        }
        @media (min-width: 768px) {
          .profile-img {
            width: 38px;
            height: 38px;
          }
        }
        .search-container {
           transition: all 0.2s;
        }
        @media (max-width: 480px) {
           .search-container {
               width: 140px;
           }
        }
      `}</style>
    </div>
  );
};

export default Topbar;
