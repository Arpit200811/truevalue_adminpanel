import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import CategoryManagement from './pages/CategoryManagement';
import ProductManagement from "./pages/ProductManagement";
import OrderManagement from "./pages/OrderManagement";
import OrderDetails from './pages/OrderDetails';
import OfferManagement from "./pages/OfferManagement";
import CustomerManagement from "./pages/CustomerManagement";
import RiderManagement from './pages/RiderManagement';
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import Reviews from "./pages/Reviews";
import SupportTickets from "./pages/SupportTickets";
import BrandManagement from "./pages/BrandManagement";
import CouponManagement from "./pages/CouponManagement";
import ZoneManagement from "./pages/ZoneManagement";
import MarketingAutomation from "./pages/MarketingAutomation";
import LiveChat from "./pages/LiveChat";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* 🔒 Protected Admin Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/categories" element={<CategoryManagement />} />
            <Route path="/brands" element={<BrandManagement />} />
            <Route path="/products" element={<ProductManagement />} />
            <Route path="/orders" element={<OrderManagement/>} />
            <Route path="/order/:id" element={<OrderDetails />} />
            <Route path="/offers" element={<OfferManagement/>} />
            <Route path="/coupons" element={<CouponManagement/>} />
            <Route path="/customers" element={<CustomerManagement/>} />
            <Route path="/riders" element={<RiderManagement/>} />
            <Route path="/zones" element={<ZoneManagement/>} />
            <Route path="/reports" element={<Reports/>} />
            <Route path="/reviews" element={<Reviews/>} />
            <Route path="/notifications" element={<Notifications/>} />
            <Route path="/settings" element={<Settings/>} />
            <Route path="/support" element={<SupportTickets/>} />
            <Route path="/automation" element={<MarketingAutomation/>} />
            <Route path="/live-chat" element={<LiveChat/>} />
            <Route path="/profile" element={<Profile/>} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound/>} />
      </Routes>
    </BrowserRouter>
     <ToastContainer position="top-right" autoClose={3000} />
     </>
  );
}

export default App;
