import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FaEye, FaSearch, FaBolt, FaBox, FaMotorcycle, FaFlask } from 'react-icons/fa';
import { Row, Col, Card, Table, Badge, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import CircleLoader from "react-spinners/CircleLoader";
import Swal from "sweetalert2";
import { DataService } from "../services/dataService";

const OrderManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const result = await DataService.getOrders({
      page,
      status: filterStatus || undefined,
      type: filterType || undefined,
      search: searchQuery || undefined,
      limit: 10
    });
    setOrders(result.data);
    setMeta(result.meta);
    setLoading(false);
  }, [page, filterStatus, filterType, searchQuery]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    setLoading(true);
    try {
      await DataService.updateOrderStatus(orderId, newStatus);
      fetchOrders();
    } catch (error) {
       setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Delivered": return <Badge bg="success" className="px-3 rounded-pill">✅ Delivered</Badge>;
      case "Pending": return <Badge bg="warning" className="px-3 rounded-pill">🕒 Pending</Badge>;
      case "Shipped": return <Badge bg="info" className="px-3 rounded-pill text-white">🚚 Out for Delivery</Badge>;
      case "Cancelled": return <Badge bg="danger" className="px-3 rounded-pill">❌ Cancelled</Badge>;
      default: return <Badge bg="secondary" className="px-3 rounded-pill">{status}</Badge>;
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case "Quick": return <Badge bg="warning" className="text-dark x-small"><FaBolt className="me-1"/> 10-MIN Delivery</Badge>;
      case "Standard": return <Badge bg="primary" className="x-small"><FaBox className="me-1"/> Standard Marketplace</Badge>;
      case "Food": return <Badge bg="danger" className="x-small"><FaMotorcycle className="me-1"/> Hot Food Delivery</Badge>;
      case "Pharma": return <Badge bg="info" className="text-white x-small"><FaFlask className="me-1"/> Rx Medicines</Badge>;
      default: return null;
    }
  };

  const downloadCSV = () => {
    const headers = ["Order ID", "Customer", "Amount", "Status", "Date", "Type"];
    const rows = filteredOrders.map(o => [
      o.id,
      o.customer || "Guest",
      o.total,
      o.status,
      o.createdAt ? new Date(o.createdAt).toLocaleString().replace(/,/g, '') : '',
      o.type || "Standard"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container-fluid py-4 bg-white min-vh-100">
      {loading && <div className="loader-overlay"><CircleLoader color="#16a34a" size={90} /></div>}

      <div className="mb-4 d-md-flex justify-content-between align-items-center gap-3 bg-light p-3 rounded-4 border">
        <div>
          <h4 className="fw-bold text-success mb-0">📦 Order Management</h4>
          <p className="text-muted small mb-0">Manage all your orders from different categories.</p>
        </div>
        <div className="d-flex gap-2 mt-3 mt-md-0">
           <Button variant="outline-dark" size="sm" className="rounded-pill px-3 fw-bold" onClick={downloadCSV}>Export Excel/CSV</Button>
           <Button variant="success" size="sm" className="rounded-pill px-3 fw-bold shadow-sm" onClick={() => {
              Swal.fire({
                title: '🔄 Shift Handover',
                html: `<div style="text-align:left;font-size:0.9rem">
                  <p><b>Current Shift Summary:</b></p>
                  <div style="background:#f8f9fa;padding:12px;border-radius:8px;margin-bottom:12px">
                    <div>📦 Total Orders: <b>${orders.length}</b></div>
                    <div>✅ Delivered: <b>${orders.filter(o => o.status === 'Delivered').length}</b></div>
                    <div>🕒 Pending: <b>${orders.filter(o => o.status === 'Pending').length}</b></div>
                    <div>❌ Cancelled: <b>${orders.filter(o => o.status === 'Cancelled').length}</b></div>
                  </div>
                </div>`,
                input: 'textarea',
                inputLabel: 'Handover Notes (optional)',
                inputPlaceholder: 'Any special instructions for the next shift...',
                showCancelButton: true,
                confirmButtonColor: '#16a34a',
                confirmButtonText: 'Confirm Handover'
              }).then(result => {
                if (result.isConfirmed) {
                  Swal.fire({ icon: 'success', title: 'Shift Handover Complete', text: `Handover recorded at ${new Date().toLocaleTimeString()}.`, confirmButtonColor: '#16a34a' });
                }
              });
           }}>Shift Handover</Button>
        </div>
      </div>

      <Row className="mb-4 g-3">
        <Col lg={9}>
          <Card className="shadow-sm rounded-4 border-0">
            <Card.Body className="p-3">
              <div className="d-flex flex-column flex-sm-row gap-2">
                <div className="input-group flex-grow-1 bg-light rounded-pill overflow-hidden">
                  <span className="input-group-text bg-transparent border-0"><FaSearch className="text-muted small"/></span>
                  <Form.Control 
                    placeholder="Search by Order ID or Customer..." 
                    className="border-0 bg-transparent shadow-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Form.Select 
                  size="sm" 
                  className="rounded-pill px-3 fw-bold border-0 shadow-sm" 
                  style={{ width: '130px', backgroundColor: '#f8f9fa' }}
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                >
                  <option value="">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </Form.Select>
                <Form.Select 
                  className="w-100 w-sm-auto border-0 bg-light shadow-none fw-bold small rounded-pill px-3"
                  style={{ minWidth: '180px' }}
                  value={filterType}
                  onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
                >
                  <option value="">All Categories</option>
                  <option value="Quick">Quick Commerce</option>
                  <option value="Standard">Marketplace</option>
                  <option value="Food">Food Delivery</option>
                  <option value="Pharma">Pharma</option>
                </Form.Select>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3}>
           <Card className="border-0 shadow-sm rounded-4 bg-success text-white h-100">
              <Card.Body className="d-flex flex-column justify-content-center">
                 <div className="x-small text-uppercase fw-bold opacity-75">Fleet Active Today</div>
                 <h4 className="mb-0 fw-bold">1,248 <span className="x-small fw-normal">Riders On-field</span></h4>
              </Card.Body>
           </Card>
        </Col>
      </Row>

      <Card className="shadow-sm rounded-4 border-0 mt-4 overflow-hidden">
        <div className="table-responsive">
          <Table hover className="mb-0 align-middle">
            <thead className="bg-light">
              <tr className="small text-uppercase text-muted">
                <th className="ps-4">Order Details</th>
                <th>Customer Info</th>
                <th>Amount</th>
                <th>Status</th>
                <th>SLA & Time</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-bottom">
                  <td className="ps-4">
                    <div className="fw-bold text-success small mb-1">{order.id}</div>
                    {getTypeIcon(order.type || "Standard")}
                  </td>
                  <td>
                    <div className="fw-bold small">{order.customer}</div>
                    <div className="x-small text-muted">Sector-14, Gurgaon Center</div>
                  </td>
                  <td className="small fw-bold">₹{order.total.toLocaleString()}</td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td>
                     <div className="small fw-bold">{new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                     <span className={`x-small ${order.type === 'Quick' ? 'text-danger fw-bold' : 'text-muted'}`}>
                        {order.type === 'Quick' ? 'Delivery in 8 mins' : 'Delivery tomorrow'}
                     </span>
                  </td>
                  <td className="text-center">
                    <div className="d-flex flex-wrap justify-content-center gap-2">
                       <Button variant="light" size="sm" className="border shadow-none" onClick={() => navigate(`/order/${order.id}`)}><FaEye className="text-primary"/></Button>
                       <Form.Select 
                         size="sm" 
                         className="w-auto border shadow-none x-small fw-bold"
                         style={{ minWidth: '130px' }}
                         value={order.status}
                         onChange={(e) => handleStatusChange(order.id, e.target.value)}
                       >
                         <option value="Pending">Pending Audit</option>
                         <option value="Shipped">Dispatched / Out</option>
                         <option value="Delivered">Mark Delivered</option>
                         <option value="Cancelled">Rejection / Return</option>
                       </Form.Select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          
          <div className="d-flex justify-content-between align-items-center p-4 border-top">
             <div className="small text-muted">
                Showing {orders.length} of {meta.total} orders
             </div>
             <div className="d-flex gap-2">
                <Button 
                   variant="light" 
                   size="sm" 
                   className="rounded-pill px-3 fw-bold" 
                   disabled={page === 1}
                   onClick={() => setPage(p => p - 1)}
                >Previous</Button>
                <div className="d-flex align-items-center px-3 fw-bold bg-light rounded-pill small">
                   Page {page} of {meta.totalPages}
                </div>
                <Button 
                   variant="light" 
                   size="sm" 
                   className="rounded-pill px-3 fw-bold"
                   disabled={page === meta.totalPages}
                   onClick={() => setPage(p => p + 1)}
                >Next</Button>
             </div>
          </div>
        </div>
      </Card>

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

export default OrderManagement;
