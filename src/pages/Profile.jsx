import React, { useState, useEffect } from "react";
import { Card, Row, Col, Form, Button, Badge } from "react-bootstrap";
import { FaUser, FaLock, FaCamera, FaEnvelope, FaPhone, FaShieldAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import { DataService } from "../services/dataService";

const Profile = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('ec_admin_user')) || {});
  const [loading, setLoading] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
    name: user.name || "",
    avatar: user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Aditya",
    phone: user.phone || ""
  });

  const [passForm, setPassForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await DataService.updateProfile({ ...profileForm, id: user.id });
      const updatedUser = { ...user, ...res.data };
      setUser(updatedUser);
      localStorage.setItem('ec_admin_user', JSON.stringify(updatedUser));
      Swal.fire("Success", "Profile updated successfully!", "success");
    } catch (e) {
      Swal.fire("Error", "Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      return Swal.fire("Error", "Passwords do not match", "error");
    }
    setLoading(true);
    try {
      await DataService.updatePassword({ 
        id: user.id, 
        currentPassword: passForm.currentPassword, 
        newPassword: passForm.newPassword 
      });
      setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      Swal.fire("Success", "Password changed successfully!", "success");
    } catch (e) {
      Swal.fire("Error", "Current password incorrect or update failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const res = await DataService.uploadImage(file);
        setProfileForm({ ...profileForm, avatar: res.url });
      } catch (e) {
        Swal.fire("Error", "Avatar upload failed", "error");
      }
    }
  };

  return (
    <div className="container-fluid py-4 bg-white min-vh-100">
      <div className="mb-4 bg-light p-3 rounded-4 border">
        <h4 className="fw-bold text-success mb-1">👤 Account Settings</h4>
        <p className="text-muted small mb-0">Manage your administrative profile and security.</p>
      </div>

      <Row className="g-4">
        <Col lg={4}>
          <Card className="shadow-sm rounded-4 border-0 text-center p-4 h-100">
            <div className="position-relative d-inline-block mx-auto mb-3">
              <div className="rounded-circle overflow-hidden border profile-avatar-lg" style={{ width: '120px', height: '120px' }}>
                <img src={profileForm.avatar} alt="avatar" className="w-100 h-100 object-fit-cover" />
              </div>
              <label htmlFor="avatar-upload" className="position-absolute bottom-0 end-0 bg-success text-white rounded-circle p-2 cursor-pointer shadow">
                <FaCamera size={14} />
                <input type="file" id="avatar-upload" hidden onChange={handleAvatarChange} />
              </label>
            </div>
            <h5 className="fw-bold mb-1">{user.name}</h5>
            <div className="text-muted small mb-3">{user.email}</div>
            <Badge bg="success" className="bg-opacity-10 text-success border px-3 py-2 mb-4">
               <FaShieldAlt className="me-2"/> System Admin
            </Badge>
            
            <div className="text-start mt-4">
               <div className="d-flex align-items-center gap-3 mb-3 small text-muted">
                  <FaEnvelope className="text-success" /> {user.email}
               </div>
               <div className="d-flex align-items-center gap-3 mb-3 small text-muted">
                  <FaPhone className="text-success" /> {profileForm.phone || "+91 XXXXX XXXXX"}
               </div>
            </div>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="shadow-sm rounded-4 border-0 p-4 mb-4">
            <h6 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <FaUser className="text-success"/> Personal Information
            </h6>
            <Form onSubmit={handleProfileUpdate}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold">Full Name</Form.Label>
                    <Form.Control required value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="bg-light border-0 py-2 shadow-none" />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold">Phone Number</Form.Label>
                    <Form.Control value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className="bg-light border-0 py-2 shadow-none" />
                  </Form.Group>
                </Col>
              </Row>
              <Button variant="success" type="submit" disabled={loading} className="rounded-pill px-4 fw-bold mt-2 shadow-sm">
                Save Changes
              </Button>
            </Form>
          </Card>

          <Card className="shadow-sm rounded-4 border-0 p-4">
            <h6 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <FaLock className="text-warning"/> Security & Password
            </h6>
            <Form onSubmit={handlePasswordUpdate}>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">Current Password</Form.Label>
                <Form.Control required type="password" value={passForm.currentPassword} onChange={e => setPassForm({...passForm, currentPassword: e.target.value})} className="bg-light border-0 py-2 shadow-none" />
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold">New Password</Form.Label>
                    <Form.Control required type="password" value={passForm.newPassword} onChange={e => setPassForm({...passForm, newPassword: e.target.value})} className="bg-light border-0 py-2 shadow-none" />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold">Confirm New Password</Form.Label>
                    <Form.Control required type="password" value={passForm.confirmPassword} onChange={e => setPassForm({...passForm, confirmPassword: e.target.value})} className="bg-light border-0 py-2 shadow-none" />
                  </Form.Group>
                </Col>
              </Row>
              <Button variant="outline-dark" type="submit" disabled={loading} className="rounded-pill px-4 fw-bold mt-2">
                Update Security Credentials
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
      
      <style>{`
        .cursor-pointer { cursor: pointer; }
        .profile-avatar-lg { border: 4px solid #f8f9fa; }
      `}</style>
    </div>
  );
};

export default Profile;
