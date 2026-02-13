import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaChartLine,
  FaBoxOpen,
  FaLayerGroup,
  FaShoppingCart,
  FaPercentage,
  FaUsers,
  FaCog,
  FaBell,
  FaSignOutAlt,
  FaFileInvoiceDollar,
  FaStar,
  FaHeadset,
  FaTimes,
  FaGlobe,
  FaIndustry,
  FaTicketAlt,
  FaMapMarkedAlt,
  FaTruck,
  FaRocket,
  FaComments
} from 'react-icons/fa';
import { DataService } from '../services/dataService';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ closeSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    DataService.logout();
    navigate('/');
  };

  return (
    <div className="sidebar-inner bg-white h-100 d-flex flex-column px-3">
      {/* Brand & Close Button (Mobile Only) */}
      <div className="brand position-relative py-4">
        <h4 className="fw-bold text-success text-center mb-0">
          CLOUDE<br />
          <span style={{ fontSize: '0.6rem', color: '#666', letterSpacing: '1px' }}>GLOBAL HYPERMARKET</span>
        </h4>
        <button 
          className="btn d-md-none position-absolute top-50 end-0 translate-middle-y text-muted"
          onClick={closeSidebar}
        >
          <FaTimes size={18} />
        </button>
      </div>
      
      <div className="sidebar-scrollable flex-grow-1">
        <ul className="sidebar-menu list-unstyled">
          <li className="menu-label x-small">Intelligence</li>
          <li>
            <NavLink to="/dashboard" onClick={closeSidebar} className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <FaChartLine /> <span className="link-text">Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/reports" onClick={closeSidebar} className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <FaFileInvoiceDollar /> <span className="link-text">Reports</span>
            </NavLink>
          </li>

          <li className="menu-label x-small">Inventory Management</li>
          <li>
            <NavLink to="/categories" onClick={closeSidebar} className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <FaLayerGroup /> <span className="link-text">Categories</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/brands" onClick={closeSidebar} className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <FaIndustry /> <span className="link-text">Brands</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/products" onClick={closeSidebar} className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <FaBoxOpen /> <span className="link-text">Products</span>
            </NavLink>
          </li>

          <li className="menu-label x-small">Orders & Customers</li>
          <li>
            <NavLink to="/orders" onClick={closeSidebar} className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <FaShoppingCart /> <span className="link-text">Orders</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/customers" onClick={closeSidebar} className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <FaUsers /> <span className="link-text">Customers</span>
            </NavLink>
          </li>

          <li className="menu-label x-small">Logistics & Delivery</li>
          <li>
            <NavLink to="/riders" onClick={closeSidebar} className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <FaTruck /> <span className="link-text">Rider Fleet</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/zones" onClick={closeSidebar} className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <FaMapMarkedAlt /> <span className="link-text">Delivery Zones</span>
            </NavLink>
          </li>

          <li className="menu-label x-small">Marketing & Growth</li>
          <li>
            <NavLink to="/offers" onClick={closeSidebar} className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <FaPercentage /> <span className="link-text">Offer Banners</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/coupons" onClick={closeSidebar} className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <FaTicketAlt /> <span className="link-text">Promo Coupons</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/reviews" onClick={closeSidebar} className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <FaStar /> <span className="link-text">Reviews</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/notifications" onClick={closeSidebar} className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <FaBell /> <span className="link-text">Notifications</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/automation" onClick={closeSidebar} className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <FaRocket /> <span className="link-text">Automation</span>
            </NavLink>
          </li>

          <li className="menu-label x-small">System Infrastructure</li>
          <li>
            <NavLink to="/settings" onClick={closeSidebar} className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <FaGlobe /> <span className="link-text">Settings</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/support" onClick={closeSidebar} className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <FaHeadset /> <span className="link-text">Support Tickets</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/live-chat" onClick={closeSidebar} className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <FaComments /> <span className="link-text">Live Chat</span>
            </NavLink>
          </li>
        </ul>
      </div>

      <div className="sidebar-footer py-3 border-top">
        <button 
          onClick={handleLogout} 
          className="sidebar-link text-danger border-0 bg-transparent w-100 text-start"
        >
          <FaSignOutAlt /> <span className="link-text">Logout</span>
        </button>
      </div>

      <style>{`
        .sidebar-inner {
          overflow: hidden;
        }
        .sidebar-scrollable {
          overflow-y: auto;
          scrollbar-width: thin;
        }
        .sidebar-scrollable::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-scrollable::-webkit-scrollbar-thumb {
          background: #eee;
          border-radius: 10px;
        }
        .menu-label {
          font-size: 0.65rem;
          text-transform: uppercase;
          color: #adb5bd;
          font-weight: 800;
          margin: 18px 0 8px 15px;
          letter-spacing: 1.2px;
        }
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 15px;
          color: #555;
          text-decoration: none;
          font-size: 0.85rem;
          border-radius: 10px;
          transition: 0.2s;
          margin-bottom: 2px;
          font-weight: 500;
        }
        .sidebar-link.active {
          background: #f0fdf4;
          color: #16a34a;
          font-weight: 700;
          box-shadow: inset 4px 0 0 #16a34a;
        }
        .sidebar-link:hover:not(.active) {
          background: #f8f9fa;
          color: #16a34a;
          transform: translateX(4px);
        }
        .x-small { font-size: 0.65rem; }
      `}</style>
    </div>
  );
};

export default Sidebar;
