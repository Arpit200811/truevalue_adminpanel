import React, { useState, useEffect } from "react";
import { Card, Table, Badge, Button, Modal, Form, Row, Col, InputGroup } from "react-bootstrap";
import { FaTicketAlt, FaPlus, FaTrash, FaCheckCircle, FaTimesCircle, FaPercentage, FaRupeeSign } from "react-icons/fa";
import Swal from "sweetalert2";
import CircleLoader from "react-spinners/CircleLoader";
import { DataService } from "../services/dataService";

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    type: "PERCENTAGE",
    value: "",
    min_order_value: 0,
    max_discount: "",
    expiryDate: "",
    isActive: true
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    const data = await DataService.getCoupons();
    setCoupons(data);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await DataService.saveCoupon(formData);
      await fetchCoupons();
      setShowModal(false);
      resetForm();
      Swal.fire("Success", "Coupon created successfully!", "success");
    } catch (error) {
      Swal.fire("Error", "Failed to save coupon", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Coupon?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        await DataService.deleteCoupon(id);
        await fetchCoupons();
        Swal.fire("Deleted!", "Coupon has been removed.", "success");
      } catch (error) {
        Swal.fire("Error", "Failed to delete coupon", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      type: "PERCENTAGE",
      value: "",
      min_order_value: 0,
      max_discount: "",
      expiryDate: "",
      isActive: true
    });
  };

  return (
    <div className="container-fluid py-4 min-vh-100 bg-white">
      {loading && <div className="loader-overlay"><CircleLoader color="#16a34a" size={90} /></div>}

      <div className="mb-4 d-md-flex justify-content-between align-items-center bg-light p-3 rounded-4 border">
        <div>
          <h4 className="fw-bold text-success mb-1">🎟️ Coupon Management</h4>
          <p className="text-muted small mb-0">Create and manage discount codes for your customers.</p>
        </div>
        <Button variant="success" className="rounded-pill px-4 fw-bold shadow-sm" onClick={() => { resetForm(); setShowModal(true); }}>
          <FaPlus className="me-2"/> Create New Coupon
        </Button>
      </div>

      <Card className="shadow-sm rounded-4 border-0 overflow-hidden">
        <div className="table-responsive">
          <Table hover className="mb-0 align-middle">
            <thead className="bg-light">
              <tr className="small text-uppercase text-muted fw-bold">
                <th className="ps-4">Coupon Code</th>
                <th>Type</th>
                <th>Value</th>
                <th>Min. Order</th>
                <th>Expiry</th>
                <th>Status</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td className="ps-4">
                    <div className="d-flex align-items-center gap-2">
                      <div className="bg-success bg-opacity-10 p-2 rounded text-success">
                        <FaTicketAlt />
                      </div>
                      <span className="fw-bold">{coupon.code}</span>
                    </div>
                  </td>
                  <td>
                    <Badge bg="info" className="bg-opacity-10 text-info border x-small">
                      {coupon.type}
                    </Badge>
                  </td>
                  <td className="fw-bold">
                    {coupon.type === "PERCENTAGE" ? `${coupon.value}%` : `₹${coupon.value}`}
                  </td>
                  <td className="small text-muted">₹{coupon.min_order_value}</td>
                  <td className="small">
                    {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : "No Expiry"}
                  </td>
                  <td>
                    {coupon.isActive ? (
                      <Badge bg="success" className="bg-opacity-10 text-success border x-small">
                        <FaCheckCircle className="me-1"/> Active
                      </Badge>
                    ) : (
                      <Badge bg="danger" className="bg-opacity-10 text-danger border x-small">
                        <FaTimesCircle className="me-1"/> Inactive
                      </Badge>
                    )}
                  </td>
                  <td className="text-center">
                    <Button variant="light white" size="sm" className="border shadow-none" onClick={() => handleDelete(coupon.id)}>
                      <FaTrash className="text-danger" />
                    </Button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center p-5 text-muted fw-bold">
                    No coupons found. Start by creating one!
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold text-success">Create Discount Coupon</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 pt-0">
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted text-uppercase">Coupon Code</Form.Label>
                  <Form.Control
                    placeholder="e.g. WELCOME50"
                    required
                    className="bg-light border-0 py-2 fw-bold text-uppercase"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted text-uppercase">Discount Type</Form.Label>
                  <Form.Select
                    className="bg-light border-0 py-2"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted text-uppercase">Value</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light border-0">
                      {formData.type === "PERCENTAGE" ? <FaPercentage size={12}/> : <FaRupeeSign size={12}/>}
                    </InputGroup.Text>
                    <Form.Control
                      type="number"
                      required
                      className="bg-light border-0 py-2"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted text-uppercase">Min Order Value</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light border-0">₹</InputGroup.Text>
                    <Form.Control
                      type="number"
                      className="bg-light border-0 py-2"
                      value={formData.min_order_value}
                      onChange={(e) => setFormData({ ...formData, min_order_value: e.target.value })}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted text-uppercase">Expiry Date</Form.Label>
                  <Form.Control
                    type="date"
                    className="bg-light border-0 py-2"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  />
                </Form.Group>
              </Col>
              {formData.type === "PERCENTAGE" && (
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-muted text-uppercase">Max Discount Limit (Optional)</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-0">₹</InputGroup.Text>
                      <Form.Control
                        type="number"
                        className="bg-light border-0 py-2"
                        value={formData.max_discount}
                        onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
              )}
            </Row>
            <div className="mt-4">
              <Button variant="success" type="submit" className="w-100 rounded-pill fw-bold py-2 shadow-sm">
                Activate Coupon Code
              </Button>
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
        .x-small { font-size: 0.7rem; }
      `}</style>
    </div>
  );
};

export default CouponManagement;
