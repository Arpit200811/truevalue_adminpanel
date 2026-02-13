import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Badge } from 'react-bootstrap';
import { FaPaperPlane, FaHistory, FaMobileAlt, FaCloudUploadAlt, FaUsers } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { DataService } from "../services/dataService";

const Notifications = () => {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [formData, setFormData] = useState({ title: '', message: '', target: 'All App Users (Android + iOS)', link: '' });

  useEffect(() => {
    const fetchData = async () => {
      const data = await DataService.getNotificationHistory();
      if (Array.isArray(data)) {
        setHistory(data);
      }
    };
    fetchData();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newNotif = {
        title: formData.title,
        message: formData.message,
        reach: formData.target === "All App Users (Android + iOS)" ? "Global (Check-in)" : formData.target,
        status: "Sent"
      };
      await DataService.saveNotification(newNotif);
      setHistory(await DataService.getNotificationHistory());
      setLoading(false);
      setFormData({ title: '', message: '', target: 'All App Users (Android + iOS)', link: '' });
      Swal.fire({
        icon: 'success',
        title: 'Broadcast Successful!',
        text: 'Notification data pushed to Firebase/APNS clusters.',
        confirmButtonColor: '#16a34a'
      });
    } catch (error) {
      setLoading(false);
      Swal.fire("Error", "Failed to send notification", "error");
    }
  };

  return (
    <div className="container-fluid py-4 min-vh-100 bg-white">
      <div className="mb-4 d-md-flex justify-content-between align-items-center gap-3 bg-light p-3 rounded-4 border">
        <div>
          <h4 className="fw-bold text-success mb-1">🔔 Notifications</h4>
          <p className="text-muted small mb-0">Send and manage app notifications.</p>
        </div>
        <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
            <div className="x-small fw-bold text-muted text-uppercase">System Status</div>
            <Badge bg="success" className="px-3 rounded-pill py-2 shadow-sm">LIVE: Broadcaster Active</Badge>
        </div>
      </div>

      <Row className="g-4">
        <Col lg={7}>
          <Card className="shadow-sm rounded-4 border-0">
            <Card.Header className="bg-white py-3 border-0 px-4">
               <h6 className="fw-bold mb-0 d-flex align-items-center gap-2 text-success"><FaCloudUploadAlt/> Create Notification</h6>
            </Card.Header>
            <Card.Body className="p-4 pt-0">
               <Form onSubmit={handleSend}>
                  <Form.Group className="mb-3">
                     <Form.Label className="small fw-bold text-muted">Notification Header (Title)</Form.Label>
                     <Form.Control 
                        required 
                        className="bg-light border-0 py-2 shadow-none"
                        value={formData.title} 
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="e.g. 🎁 Mystery Coupon Unlocked! ⚡" 
                     />
                  </Form.Group>
                  <Form.Group className="mb-3">
                     <Form.Label className="small fw-bold text-muted">Message Body (In-App Preview)</Form.Label>
                     <Form.Control 
                        required 
                        as="textarea" 
                        rows={3} 
                        className="bg-light border-0 shadow-none"
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        placeholder="Hi! We noticed you haven't checked our fresh organic section today. Get 20% off now!" 
                     />
                  </Form.Group>
                  <Row>
                     <Col md={6}>
                        <Form.Group className="mb-3">
                           <Form.Label className="small fw-bold text-muted">Target User Segment</Form.Label>
                           <Form.Select 
                              className="bg-light border-0 py-2 shadow-none"
                              value={formData.target}
                              onChange={(e) => setFormData({...formData, target: e.target.value})}
                           >
                              <option>All App Users (Android + iOS)</option>
                              <option>Android Cluster Only</option>
                              <option>iOS Cluster Only</option>
                              <option>VIP Premium Users</option>
                              <option>Inactive Users (30d+)</option>
                           </Form.Select>
                        </Form.Group>
                     </Col>
                     <Col md={6}>
                        <Form.Group className="mb-3">
                           <Form.Label className="small fw-bold text-muted">Deep-Link URL</Form.Label>
                           <Form.Control 
                              className="bg-light border-0 py-2 shadow-none"
                              value={formData.link}
                              onChange={(e) => setFormData({...formData, link: e.target.value})}
                              placeholder="e.g. cloude://app/category/groceries" 
                           />
                        </Form.Group>
                     </Col>
                  </Row>
                  <hr className="my-4 opacity-10" />
                  <Button variant="success" type="submit" className="px-5 py-2 rounded-pill fw-bold shadow-sm d-flex align-items-center gap-2" disabled={loading}>
                     {loading ? 'Transmitting Data...' : <><FaPaperPlane /> Execute Broadcast</>}
                  </Button>
               </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card className="shadow-sm rounded-4 h-100 border-0">
            <Card.Header className="bg-white py-3 px-4 d-flex justify-content-between align-items-center border-0">
               <h6 className="fw-bold mb-0 d-flex align-items-center gap-2 text-muted"><FaHistory /> Notification History</h6>
               <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-25 x-small px-3 py-2 rounded-pill">Active</Badge>
            </Card.Header>
            <Card.Body className="p-0">
               <div className="notification-list" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                  {history.map((notif, i) => (
                    <div key={i} className="p-3 border-bottom d-flex gap-3 align-items-start hover-bg-light transition-base">
                       <div className="bg-light p-2 rounded-circle d-flex align-items-center justify-content-center" style={{width: 40, height: 40}}>
                          <FaMobileAlt className="text-success" size={18} />
                       </div>
                       <div className="flex-grow-1">
                          <div className="fw-bold small">{notif.title}</div>
                          <div className="d-flex justify-content-between mt-1">
                             <span className="text-muted x-small d-flex align-items-center gap-1"><FaUsers/> {notif.reach}</span>
                             <span className="text-muted x-small">{notif.date}</span>
                          </div>
                       </div>
                    </div>
                  ))}
                  {history.length === 0 && (
                     <div className="p-5 text-center text-muted fw-bold">No history found.</div>
                  )}
               </div>
               <div className="p-3 text-center bg-light bg-opacity-50">
                  <Button variant="link" className="text-success text-decoration-none fw-bold small">View All Logs</Button>
               </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <style>{`
        .x-small { font-size: 0.7rem; }
        .hover-bg-light:hover { background-color: #f8fafc; cursor: pointer; }
        .transition-base { transition: 0.2s ease-in-out; }
        .notification-list::-webkit-scrollbar { width: 4px; }
        .notification-list::-webkit-scrollbar-thumb { background: #eee; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Notifications;
