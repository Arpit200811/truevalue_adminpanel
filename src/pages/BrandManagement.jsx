import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Modal, Row, Col, InputGroup, Badge } from 'react-bootstrap';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaGlobeAmericas, FaShieldAlt } from 'react-icons/fa';
import { DataService } from '../services/dataService';
import Swal from 'sweetalert2';

const BrandManagement = () => {
    const [brands, setBrands] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [formData, setFormData] = useState({ name: '', logo: '', website: '', status: 'Active' });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchBrands = async () => {
            const data = await DataService.getBrands();
            if (Array.isArray(data)) {
                setBrands(data);
            }
        };
        fetchBrands();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        const brandObj = {
            id: selectedBrand ? selectedBrand.id : Date.now(),
            ...formData,
        };
        await DataService.saveBrand(brandObj);
        setBrands(await DataService.getBrands());
        setShowModal(false);
        Swal.fire('Brand Registered', 'Brand is now approved for global sales.', 'success');
    };

    return (
        <div className="container-fluid py-4 min-vh-100 bg-white">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-3 bg-light p-3 rounded-4 border">
                <div>
                    <h4 className="fw-bold text-success mb-0">🏢 Brand Management</h4>
                    <p className="text-muted small mb-0">Manage all your product brands and manufacturers.</p>
                </div>
                <Button variant="success" className="rounded-pill px-4 shadow-sm fw-bold" onClick={() => { setFormData({name:'', logo:'', website:'', status:'Active'}); setSelectedBrand(null); setShowModal(true); }}>
                    <FaPlus className="me-2" /> Add New Brand
                </Button>
            </div>

            <Row className="mb-4">
               <Col md={6}>
                  <InputGroup className="bg-light border rounded-pill overflow-hidden shadow-sm">
                     <InputGroup.Text className="bg-transparent border-0"><FaSearch className="text-muted"/></InputGroup.Text>
                     <Form.Control 
                        placeholder="Search by Brand Name..." 
                        className="bg-transparent border-0 shadow-none ps-0"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                     />
                  </InputGroup>
               </Col>
            </Row>

            <Card className="shadow-sm rounded-4 overflow-hidden border-0">
                <div className="table-responsive">
                    <Table hover className="mb-0 align-middle">
                        <thead className="bg-light">
                            <tr className="small text-uppercase text-muted">
                                <th className="ps-4">Brand Details</th>
                                <th>Status</th>
                                <th>Website</th>
                                <th>Verification</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {brands.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase())).map(b => (
                                <tr key={b.id}>
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="brand-logo-circle bg-light d-flex align-items-center justify-content-center overflow-hidden border" style={{width: 45, height: 45, borderRadius: 12}}>
                                                {b.logo ? <img src={b.logo} alt="" className="w-100 p-2"/> : <FaGlobeAmericas className="text-muted opacity-25" size={20}/>}
                                            </div>
                                            <div>
                                                <div className="fw-bold small">{b.name}</div>
                                                <div className="x-small text-muted">Partnered since 2024</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><Badge bg="success" className="bg-opacity-10 text-success x-small px-3 border border-success border-opacity-25 rounded-pill">Premium Partner</Badge></td>
                                    <td className="small text-primary text-decoration-underline cursor-pointer">view official docs</td>
                                    <td>
                                       <div className="d-flex align-items-center gap-1 text-success x-small fw-bold">
                                          <FaShieldAlt /> Global Verified
                                       </div>
                                    </td>
                                    <td className="text-center">
                                        <div className="d-flex justify-content-center gap-2">
                                            <Button variant="light border" size="sm" onClick={() => { setSelectedBrand(b); setFormData(b); setShowModal(true); }}><FaEdit className="text-primary"/></Button>
                                            <Button variant="light border" size="sm" onClick={() => {
                                                Swal.fire({
                                                    title: `Delete ${b.name}?`,
                                                    text: "This manufacturer will be removed from all products.",
                                                    icon: 'warning',
                                                    showCancelButton: true
                                                }).then(async r => {
                                                    if(r.isConfirmed) {
                                                        await DataService.deleteBrand(b.id);
                                                        setBrands(await DataService.getBrands());
                                                        Swal.fire('Deleted', 'Brand removed.', 'success');
                                                    }
                                                })
                                            }}><FaTrash className="text-danger"/></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold text-success">Add/Edit Brand</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4 pt-1">
                    <Form onSubmit={handleSave}>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-muted">Brand Name</Form.Label>
                            <Form.Control 
                               required 
                               className="bg-light border-0 py-2 shadow-none" 
                               value={formData.name}
                               onChange={(e) => setFormData({...formData, name: e.target.value})}
                               placeholder="e.g. Apple, Samsung"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-muted">Logo URL (Optional)</Form.Label>
                            <Form.Control 
                               className="bg-light border-0 py-2 shadow-none" 
                               value={formData.logo}
                               onChange={(e) => setFormData({...formData, logo: e.target.value})}
                               placeholder="https://logo.clearbit.com/..."
                            />
                        </Form.Group>
                        <hr className="my-4 opacity-10" />
                        <div className="d-flex justify-content-end gap-2">
                            <Button variant="light" onClick={() => setShowModal(false)} className="rounded-pill px-4">Cancel</Button>
                            <Button variant="success" type="submit" className="rounded-pill px-4 shadow-sm fw-bold">Save Brand</Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
            
            <style>{`.x-small { font-size: 0.7rem; }`}</style>
        </div>
    );
};

export default BrandManagement;
