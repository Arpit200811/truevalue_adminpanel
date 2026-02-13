import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Form, Row, Col, InputGroup, ProgressBar } from 'react-bootstrap';
import { FaHeadset, FaSearch, FaRegEnvelope, FaReply, FaCheckCircle, FaExclamationTriangle, FaRobot } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { DataService } from "../services/dataService";

const SupportTickets = () => {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await DataService.getTickets();
      if (Array.isArray(data)) {
        setTickets(data);
      }
    };
    fetchData();
  }, []);

  const handleResolve = async (id) => {
    await DataService.updateTicket(id, "Resolved");
    setTickets(await DataService.getTickets());
    Swal.fire({ icon: 'success', title: 'Case Closed', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
  };

  const handleReply = (id, user) => {
    Swal.fire({
      title: `Response to ${user}`,
      input: 'textarea',
      inputPlaceholder: 'Type your official response here...',
      confirmButtonColor: '#16a34a',
      confirmButtonText: 'Send to Customer App',
      showCancelButton: true,
      showLoaderOnConfirm: true,
      preConfirm: async (message) => {
        try {
          if (!message) throw new Error("Message cannot be empty");
          return await DataService.replyToTicket(id, message);
        } catch (error) {
          Swal.showValidationMessage(`Request failed: ${error}`);
        }
      }
    }).then(async res => {
      if(res.isConfirmed) {
        setTickets(await DataService.getTickets());
        Swal.fire('Sent!', 'Message dispatched to user inbox.', 'success');
      }
    });
  };

  const filteredTickets = tickets.filter(t => {
    const matchFilter = filter === "All" || t.status === filter || t.priority === filter;
    const matchSearch = t.user.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const categories = ["All", "Open", "In Progress", "Resolved", "Critical"];

  return (
    <div className="container-fluid py-4 min-vh-100 bg-white">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-3 bg-light p-3 rounded-4 border">
        <div>
          <h4 className="fw-bold text-success mb-0 d-flex align-items-center gap-2">
            <FaHeadset /> Support Tickets
          </h4>
          <p className="text-muted small mb-0">Manage customer queries and support tickets.</p>
        </div>
        <div className="d-flex gap-2 mt-3 mt-md-0">
           <Button variant="light border" size="sm" className="rounded-pill px-3 fw-bold">Error Logs</Button>
           <Button variant="success" size="sm" className="rounded-pill px-3 fw-bold shadow-sm" onClick={() => Swal.fire('Agent Status','Switched to AUTO-AI handling mode.', 'success')}>
              <FaRobot className="me-1"/> AI Mode
           </Button>
        </div>
      </div>

      <Row className="mb-4 g-3">
         {categories.map((cat, i) => (
            <Col key={i} xs={6} md={2} lg={2}>
               <Button 
                variant={filter === cat ? "success" : "white"} 
                className={`w-100 shadow-sm py-2 rounded-pill small fw-bold ${filter === cat ? "text-white bg-success border-0" : "text-muted border bg-white"}`}
                onClick={() => setFilter(cat)}
               >
                  {cat === "Critical" ? "🚨 " + cat : cat}
               </Button>
            </Col>
         ))}
      </Row>

      <Card className="shadow-sm rounded-4 overflow-hidden border-0 bg-white">
        <Card.Header className="bg-white py-3 border-0 px-4">
          <InputGroup className="bg-light border rounded-pill overflow-hidden" style={{ maxWidth: '400px' }}>
            <InputGroup.Text className="bg-transparent border-0"><FaSearch className="text-muted small"/></InputGroup.Text>
            <Form.Control 
                placeholder="Search by ID or Customer..." 
                className="bg-transparent border-0 shadow-none ps-0"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </Card.Header>
        <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
            <thead className="bg-light">
                <tr className="small text-uppercase text-muted fw-bold">
                <th className="ps-4">Ticket Details</th>
                <th>Customer</th>
                <th>Subject</th>
                <th>Priority</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
                </tr>
            </thead>
            <tbody>
                {filteredTickets.map(t => (
                <tr key={t.id}>
                    <td className="ps-4">
                        <div className="fw-bold text-success small">{t.id}</div>
                        <div className="x-small text-muted">{t.date}</div>
                    </td>
                    <td className="fw-semibold small">{t.user}</td>
                    <td style={{ maxWidth: '280px' }}>
                    <div className="fw-bold small text-truncate">{t.subject}</div>
                    <Badge bg="light" className="text-dark border font-weight-normal x-small">{t.category}</Badge>
                    </td>
                    <td>
                    <Badge bg={t.priority === "Critical" ? "danger" : t.priority === "High" ? "warning" : t.priority === "Medium" ? "info" : "light"} className={t.priority === "Medium" ? 'text-white' : 'text-dark border'}>
                        {t.priority}
                    </Badge>
                    </td>
                    <td>
                    <div className="d-flex align-items-center gap-2">
                        <div className={`rounded-circle`} style={{ width: 8, height: 8, background: t.status === "Open" ? "#ef4444" : t.status === "In Progress" ? "#3b82f6" : "#16a34a" }}></div>
                        <span className="x-small fw-bold">{t.status}</span>
                    </div>
                    </td>
                    <td className="text-center">
                    <div className="d-flex justify-content-center gap-2">
                        <Button variant="light border" size="sm" className="rounded-circle" onClick={() => handleReply(t.id, t.user)}><FaReply className="text-primary"/></Button>
                        {t.status !== "Resolved" && (
                            <Button variant="light border" size="sm" className="rounded-circle" onClick={() => handleResolve(t.id)}><FaCheckCircle className="text-success"/></Button>
                        )}
                        {t.priority === "Critical" && <FaExclamationTriangle className="text-danger mt-1 animate-pulse" title="Immediate Attention Required"/>}
                    </div>
                    </td>
                </tr>
                ))}
            </tbody>
            </Table>
        </div>
      </Card>

      <div className="mt-4">
         <Card className="shadow-sm rounded-4 bg-success bg-opacity-10 border-0">
            <Card.Body className="p-4">
               <Row className="align-items-center">
                  <Col md={8}>
                    <h6 className="fw-bold mb-1 text-success">Customer Service Health Index (Global)</h6>
                    <p className="text-muted small mb-3">Target Response Time: <b>10 mins</b> | Current Performance: <b>14.2 mins</b></p>
                    <ProgressBar now={88} variant="success" className="rounded-pill" style={{ height: '8px' }} />
                  </Col>
                  <Col md={4} className="text-md-end mt-3 mt-md-0">
                    <Button variant="success" className="rounded-pill px-4 fw-bold">Live Fleet Support</Button>
                  </Col>
               </Row>
            </Card.Body>
         </Card>
      </div>

      <style>{`
        .x-small { font-size: 0.7rem; }
        .animate-pulse { animation: pulse 2s infinite; }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default SupportTickets;
