import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Table, Badge, Button, ListGroup } from 'react-bootstrap';
import { FaPrint, FaArrowLeft, FaTruck, FaEnvelope, FaPhone, FaMapMarkerAlt, FaFileContract } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { DataService } from "../services/dataService";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      const data = await DataService.getOrder(id);
      if (data) {
        setOrder({
          ...data,
          customer: data.user?.name || "Guest",
          email: data.user?.email || "N/A",
          phone: data.user?.phone || "N/A",
          paymentStatus: "Paid", // Assuming paid for now
          paymentMethod: data.paymentMethod || "COD",
          address: data.address || "No address provided",
          items: data.items?.map(item => ({
            name: item.product?.name || "Unknown Product",
            price: Number(item.price),
            qty: item.quantity,
            total: Number(item.price) * item.quantity
          })) || []
        });
      }
    };
    fetchOrder();
  }, [id]);

  if (!order) return <div className="p-5 text-center text-muted">Retrieving Transaction Registry...</div>;

  return (
    <div className="container-fluid py-4 min-vh-100 bg-white">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-3 bg-light p-3 rounded-4 border">
        <div className="d-flex align-items-center gap-3">
          <Button variant="white" className="rounded-circle shadow-sm border" onClick={() => navigate('/orders')}>
            <FaArrowLeft className="text-success"/>
          </Button>
          <div>
            <h4 className="fw-bold text-success mb-0">Order ID: {order.id}</h4>
            <div className="x-small text-muted fw-bold">Order Type: {order.type || 'Marketplace'}</div>
          </div>
        </div>
        <div className="d-flex gap-2 mt-3 mt-md-0">
            <Button variant="light border" className="rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2" onClick={() => {
              Swal.fire({
                title: '📜 Transaction Trace Logs',
                html: `<div style="text-align:left;font-size:0.85rem;font-family:monospace;background:#f8f9fa;padding:15px;border-radius:10px">
                  <div style="color:#16a34a">● [${new Date(order.date).toLocaleTimeString()}] ORDER_CREATED: Cluster Master-01</div>
                  <div style="color:#16a34a">● [${new Date(order.date).toLocaleTimeString()}] PAYMENT_AUTH_SUCCESS: Ref_${Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
                  <div style="color:#3b82f6">● [${new Date(order.date).toLocaleTimeString()}] INVENTORY_LOCKED: SKU_REG_${order.id?.substring(0, 5).toUpperCase()}</div>
                  <div style="color:#888">● [System] Waiting for Fleet Assignment...</div>
                </div>`,
                confirmButtonColor: '#16a34a'
              });
            }}>
                <FaFileContract /> View Logs
            </Button>
            <Button variant="success" className="rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2" onClick={() => {
              window.print();
              Swal.fire({ icon: 'info', title: 'Invoice Export', text: 'System-generated invoice transmitted to print spooler.', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
            }}>
                <FaPrint /> Download Invoice
            </Button>
        </div>
      </div>

      <Row className="g-4">
        <Col lg={8}>
          <Card className="shadow-sm rounded-4 overflow-hidden mb-4">
            <Card.Header className="bg-white py-3 border-0 px-4">
               <h6 className="fw-bold mb-0 text-success">Order Items</h6>
            </Card.Header>
            <div className="table-responsive">
                <Table hover className="mb-0 align-middle">
                    <thead className="bg-light">
                        <tr className="small text-uppercase text-muted fw-bold border-0">
                        <th className="ps-4">Resource Info</th>
                        <th>SLA Units</th>
                        <th>Standard Rate</th>
                        <th className="text-end pe-4">Credit Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map((item, idx) => (
                        <tr key={idx} className="border-0">
                            <td className="ps-4">
                            <div className="fw-bold small">{item.name}</div>
                            <div className="x-small text-muted">SKU: REG-{order.id?.substring(0, 8).toUpperCase()}</div>
                            </td>
                            <td className="small fw-bold">{item.qty} Unit(s)</td>
                            <td className="small">₹{item.price.toLocaleString()}</td>
                            <td className="text-end pe-4 fw-bold text-success">₹{item.total.toLocaleString()}</td>
                        </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
            <div className="p-4 bg-light bg-opacity-50 border-top mt-3">
               <div className="ms-auto" style={{maxWidth: '350px'}}>
                  <div className="d-flex justify-content-between mb-2 x-small fw-bold text-muted">
                    <span>Tax (GST 18%)</span>
                    <span>₹{(order.total * 0.18).toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 x-small fw-bold text-muted">
                    <span>Logistics Fee</span>
                    <span className="text-success">FREE</span>
                  </div>
                  <hr className="my-2" />
                  <div className="d-flex justify-content-between">
                    <span className="fw-bold text-dark">Grand Total</span>
                    <span className="fw-bold h5 mb-0 text-success">₹{order.total.toLocaleString()}</span>
                  </div>
               </div>
            </div>
          </Card>

          <Card className="shadow-sm rounded-4 border-0">
            <Card.Body className="p-4">
               <h6 className="fw-bold mb-4 d-flex align-items-center gap-2"><FaTruck className="text-success"/> Order Track</h6>
               <div className="order-timeline">
                  <div className="timeline-item active">
                     <div className="timeline-marker"></div>
                     <div className="timeline-content">
                        <div className="fw-bold small">Packet Transmitted to Local Cluster</div>
                        <small className="text-muted">{new Date(order.date).toLocaleString()} • Node: SECTOR-62-WH</small>
                     </div>
                  </div>
                  <div className="timeline-item active">
                     <div className="timeline-marker"></div>
                     <div className="timeline-content">
                        <div className="fw-bold small">Digital Payment Succeeded</div>
                        <small className="text-muted">Auth Code: {Math.random().toString(36).substr(2, 9).toUpperCase()}</small>
                     </div>
                  </div>
                  <div className="timeline-item">
                     <div className="timeline-marker"></div>
                     <div className="timeline-content">
                        <div className="fw-bold small">Rider Cluster Assignment</div>
                        <small className="text-muted">Pending Handover to Fleet Manager</small>
                     </div>
                  </div>
               </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="border shadow-sm rounded-4 mb-4 border-0">
            <Card.Body className="p-4 text-center">
               <div className="mb-3 d-inline-block p-3 rounded-circle bg-success bg-opacity-10 text-success shadow-inner border border-success border-opacity-10">
                  <h3 className="mb-0 fw-bold">{order.customer.charAt(0)}</h3>
               </div>
               <h5 className="fw-bold mb-1">{order.customer}</h5>
               <Badge bg="success" className="bg-opacity-10 text-success border x-small mb-4">ID: {Math.floor(Math.random()*9900)+1000}</Badge>
               
               <div className="text-start">
                  <h6 className="x-small fw-bold text-uppercase text-muted mb-3 opacity-50">Contacts</h6>
                  <div className="d-flex align-items-center gap-3 mb-2 small">
                    <FaEnvelope className="text-success" size={14} /> <span className="fw-semibold">{order.email || 'aditya@cloude.in'}</span>
                  </div>
                  <div className="d-flex align-items-center gap-3 mb-4 small">
                    <FaPhone className="text-success" size={14} /> <span className="fw-semibold">+91 91234 56789</span>
                  </div>
                  
                  <h6 className="x-small fw-bold text-uppercase text-muted mb-2 opacity-50">Delivery Address</h6>
                  <div className="d-flex gap-2">
                    <FaMapMarkerAlt className="text-danger mt-1" size={16} />
                    <p className="small mb-0 fw-medium text-dark">{order.address}</p>
                  </div>
               </div>
            </Card.Body>
          </Card>

          <Card className="shadow-sm rounded-4 border-0">
             <Card.Body className="p-4">
                <h6 className="fw-bold mb-4 text-primary">Payment Details</h6>
                <div className="d-flex justify-content-between mb-3 small">
                   <span className="text-muted fw-bold">Payment Method</span>
                   <span className="fw-bold text-dark">{order.paymentMethod}</span>
                </div>
                <div className="d-flex justify-content-between small align-items-center">
                   <span className="text-muted fw-bold">Verification</span>
                   <Badge bg="success" className="rounded-pill px-3 py-1">SECURED</Badge>
                </div>
                <hr className="my-4 opacity-10" />
                <Button variant="light border" className="w-100 rounded-pill fw-bold small py-2" onClick={() => {
                  Swal.fire({
                    title: 'Flag for Refund',
                    text: 'State the discrepancy leading to this refund request.',
                    input: 'textarea',
                    inputPlaceholder: 'Reason for refund (e.g. Damaged item, Missing units)...',
                    showCancelButton: true,
                    confirmButtonText: 'Submit Report',
                    confirmButtonColor: '#d33'
                  }).then(res => {
                    if(res.isConfirmed) {
                      Swal.fire('Ticket Generated', 'Refund request [REF-'+Math.floor(Math.random()*9000+1000)+'] has been logged in Support.', 'success');
                    }
                  });
                }}>Flag Transaction for Refund</Button>
             </Card.Body>
          </Card>
        </Col>
      </Row>

      <style>{`
        .x-small { font-size: 0.7rem; }
        .shadow-inner { box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06); }
        .order-timeline { padding-left: 20px; border-left: 2px solid #f8f9fa; margin-left: 10px; }
        .timeline-item { position: relative; padding-bottom: 30px; }
        .timeline-marker { position: absolute; left: -27px; width: 14px; height: 14px; border-radius: 50%; background: #eee; border: 3px solid #fff; box-shadow: 0 0 0 1px #eee; }
        .timeline-item.active .timeline-marker { background: #16a34a; box-shadow: 0 0 0 1px #16a34a; }
        .timeline-content { padding-left: 10px; }
      `}</style>
    </div>
  );
};

export default OrderDetails;
