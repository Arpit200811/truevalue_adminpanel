import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { DataService } from '../services/dataService';

const ProtectedRoute = () => {
    const isAuth = DataService.isAuthenticated();
    
    // In a real app, you would verify the token with the backend here
    return isAuth ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
