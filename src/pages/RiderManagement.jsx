import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { FaUserPlus, FaMotorcycle, FaStar, FaEdit, FaTrash, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';
import CircleLoader from "react-spinners/CircleLoader";
import { DataService } from "../services/dataService";

const RiderManagement = () => {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentRider, setCurrentRider] = useState({
    name: '', email: '', phone: '', vehicle_number: '', license_number: '', status: 'Active', availability: 'Offline'
  });

  useEffect(() => {
    fetchRiders();
  }, []);

  const fetchRiders = async () => {
    setLoading(true);
    const data = await DataService.getRiders();
    if (Array.isArray(data)) setRiders(data);
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await DataService.saveRider(currentRider);
      await fetchRiders();
      setShowModal(false);
      Swal.fire("Success", "Rider profile updated.", "success");
    } catch (error) {
      Swal.fire("Error", "Failed to save rider.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Remove Rider?',
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
    }).then(async (result) => {
      if (result.isConfirmed) {
        await DataService.deleteRider(id);
        fetchRiders();
        Swal.fire('Deleted!', 'Rider has been removed.', 'success');
      }
    });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Active': return <Badge bg="success">Active</Badge>;
      case 'Banned': return <Badge bg="danger">Banned</Badge>;
      default: return <Badge bg="secondary">Inactive</Badge>;
    }
  };

  const getAvailabilityBadge = (status) => {
    switch(status) {
      case 'Online': return <Badge bg="success" className="rounded-pill"><div className="d-flex align-items-center gap-1"><div className="bg-white rounded-circle" style={{width: 6, height: 6}}></div> Online</div></Badge>;
      case 'Busy': return <Badge bg="warning" className="text-dark rounded-pill">Busy</Badge>;
      default: return <Badge bg="secondary" className="rounded-pill">Offline</Badge>;
    }
  };

  return (
    <div className="container-fluid py-4 min-vh-100 bg-white">
      {loading && <div className="loader-overlay"><CircleLoader color="#16a34a" size={90} /></div>}

      <div className="mb-4 d-md-flex justify-content-between align-items-center gap-3 bg-light p-3 rounded-4 border">
        <div>
          <h4 className="fw-bold text-success mb-1">🛵 Fleet Management</h4>
          <p className="text-muted small mb-0">Monitor and manage your delivery partners.</p>
        </div>
        <Button variant="success" className="rounded-pill px-4 fw-bold shadow-sm" onClick={() => { setCurrentRider({}); setShowModal(true); }}>
          <FaUserPlus className="me-2"/> Add New Rider
        </Button>
      </div>

      <div className="row g-4">
        <div className="col-md-12">
           <Card className="shadow-sm rounded-4 border-0 overflow-hidden">
             <div className="table-responsive">
               <Table hover className="mb-0 align-middle">
                 <thead className="bg-light">
                   <tr className="small text-uppercase text-muted">
                     <th className="ps-4">Rider Profile</th>
                     <th>Contact Info</th>
                     <th>Vehicle Details</th>
                     <th>Performance</th>
                     <th>Status</th>
                     <th className="text-center">Action</th>
                   </tr>
                 </thead>
                  <tbody>
                    {riders.map(rider => (
                      <tr key={rider.id}>
                        <td className="ps-4">
                          <div className="d-flex align-items-center gap-3">
                             <div className="bg-light rounded-circle d-flex align-items-center justify-content-center border" style={{width: 45, height: 45}}>
                                <FaMotorcycle className="text-muted" size={20}/>
                             </div>
                             <div>
                                <div className="fw-bold small">{rider.name}</div>
                                <div className="x-small text-muted">Joined: {new Date(rider.joinedAt).toLocaleDateString()}</div>
                             </div>
                          </div>
                        </td>
                        <td>
                           <div className="small fw-bold"><FaPhoneAlt className="me-1 text-muted x-small"/> {rider.phone}</div>
                           <div className="x-small text-muted">{rider.email}</div>
                        </td>
                        <td>
                           <div className="small fw-bold">{rider.vehicle_number || "N/A"}</div>
                           <div className="x-small text-muted">Lic: {rider.license_number || "N/A"}</div>
                        </td>
                        <td>
                           <div className="d-flex align-items-center gap-1 small fw-bold text-warning">
                              <FaStar/> {rider.rating || 5.0}
                           </div>
                           <div className="x-small text-muted">{rider.total_deliveries} Deliveries</div>
                        </td>
                        <td>
                           <div className="d-flex flex-column gap-1 align-items-start">
                              {getStatusBadge(rider.status)}
                              {getAvailabilityBadge(rider.availability)}
                           </div>
                        </td>
                        <td className="text-center">
                           <div className="d-flex justify-content-center gap-2">
                             <Button variant="light white" size="sm" className="border shadow-sm rounded-circle" title="Track Location"><FaMapMarkerAlt className="text-success"/></Button>
                             <Button variant="light white" size="sm" className="border shadow-sm rounded-circle" onClick={() => { setCurrentRider(rider); setShowModal(true); }}><FaEdit className="text-primary"/></Button>
                             <Button variant="light white" size="sm" className="border shadow-sm rounded-circle" onClick={() => handleDelete(rider.id)}><FaTrash className="text-danger"/></Button>
                           </div>
                        </td>
                      </tr>
                    ))}
                    {riders.length === 0 && <tr><td colSpan="6" className="text-center p-5 text-muted fw-bold">No riders found. Add your first delivery partner.</td></tr>}
                  </tbody>
               </Table>
             </div>
           </Card>
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold text-success">{currentRider.id ? 'Edit Rider' : 'Onboard New Rider'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSave}>
             <Row className="g-3">
                <Col md={12}>
                   <Form.Group>
                      <Form.Label className="small fw-bold text-muted">Full Name</Form.Label>
                      <Form.Control required value={currentRider.name || ''} onChange={(e) => setCurrentRider({...currentRider, name: e.target.value})} className="bg-light border-0"/>
                   </Form.Group>
                </Col>
                <Col md={6}>
                   <Form.Group>
                      <Form.Label className="small fw-bold text-muted">Phone Number</Form.Label>
                      <Form.Control required value={currentRider.phone || ''} onChange={(e) => setCurrentRider({...currentRider, phone: e.target.value})} className="bg-light border-0"/>
                   </Form.Group>
                </Col>
                <Col md={6}>
                   <Form.Group>
                      <Form.Label className="small fw-bold text-muted">Email Address</Form.Label>
                      <Form.Control type="email" required value={currentRider.email || ''} onChange={(e) => setCurrentRider({...currentRider, email: e.target.value})} className="bg-light border-0"/>
                   </Form.Group>
                </Col>
                <Col md={6}>
                   <Form.Group>
                      <Form.Label className="small fw-bold text-muted">Vehicle Number</Form.Label>
                      <Form.Control required value={currentRider.vehicle_number || ''} onChange={(e) => setCurrentRider({...currentRider, vehicle_number: e.target.value})} className="bg-light border-0"/>
                   </Form.Group>
                </Col>
                <Col md={6}>
                   <Form.Group>
                      <Form.Label className="small fw-bold text-muted">License Number</Form.Label>
                      <Form.Control required value={currentRider.license_number || ''} onChange={(e) => setCurrentRider({...currentRider, license_number: e.target.value})} className="bg-light border-0"/>
                   </Form.Group>
                </Col>
                <Col md={6}>
                   <Form.Group>
                      <Form.Label className="small fw-bold text-muted">Account Status</Form.Label>
                      <Form.Select value={currentRider.status || 'Active'} onChange={(e) => setCurrentRider({...currentRider, status: e.target.value})} className="bg-light border-0">
                         <option value="Active">Active</option>
                         <option value="Inactive">Inactive</option>
                         <option value="Banned">Banned</option>
                      </Form.Select>
                   </Form.Group>
                </Col>
             </Row>
             <div className="mt-4 d-grid">
                <Button variant="success" type="submit" className="rounded-pill fw-bold py-2 shadow-sm">Save Rider Profile</Button>
             </div>
          </Form>
        </Modal.Body>
      </Modal>

      <style>{`
        .loader-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.8); z-index: 9999;
        }
        .x-small { font-size: 0.75rem; }
      `}</style>
    </div>
  );
};

export default RiderManagement;
