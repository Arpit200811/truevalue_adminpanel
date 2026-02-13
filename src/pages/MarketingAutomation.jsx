import React, { useState, useEffect } from "react";
import { Card, Row, Col, Badge, Button, Table, ProgressBar } from "react-bootstrap";
import { FaRocket, FaBolt, FaShoppingCart, FaEnvelope, FaUsers, FaChartLine, FaPlay, FaPause, FaBell, FaRedo } from "react-icons/fa";
import Swal from "sweetalert2";
import CircleLoader from "react-spinners/CircleLoader";
import { DataService } from "../services/dataService";

const MarketingAutomation = () => {
  const [loading, setLoading] = useState(false);
  const [abandonedCarts, setAbandonedCarts] = useState([]);
  const [stats, setStats] = useState({ totalCarts: 0, abandonedCount: 0, activeCount: 0, recoveryRate: 0 });

  const [campaigns] = useState([
    { id: 1, name: "Welcome Series", type: "Email", trigger: "New Signup", status: "Active", sent: 1240, converted: 312, rate: 25.2 },
    { id: 2, name: "Abandoned Cart Recovery", type: "Push + Email", trigger: "Cart Idle > 1hr", status: "Active", sent: 856, converted: 171, rate: 20.0 },
    { id: 3, name: "Re-engagement Blast", type: "SMS + Push", trigger: "Inactive 30 Days", status: "Paused", sent: 2100, converted: 126, rate: 6.0 },
    { id: 4, name: "Festive Flash Sale", type: "All Channels", trigger: "Scheduled", status: "Draft", sent: 0, converted: 0, rate: 0 },
    { id: 5, name: "Loyalty Reward Drop", type: "In-App", trigger: "5th Order", status: "Active", sent: 490, converted: 196, rate: 40.0 },
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const carts = await DataService.getAbandonedCarts();
      setAbandonedCarts(carts);
      const s = await DataService.getAutomationStats();
      if (s) setStats(s);
    } catch(e) {}
    setLoading(false);
  };

  const handleRecover = async (cartId) => {
    try {
      await DataService.triggerRecovery(cartId);
      Swal.fire({ icon: "success", title: "Recovery Sent!", text: "Push notification dispatched to customer.", toast: true, position: "top-end", showConfirmButton: false, timer: 3000 });
      fetchData();
    } catch(e) {
      Swal.fire("Error", "Recovery failed", "error");
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "Active": return <Badge bg="success" className="rounded-pill px-3 py-1"><FaPlay size={8} className="me-1"/> Active</Badge>;
      case "Paused": return <Badge bg="warning" className="text-dark rounded-pill px-3 py-1"><FaPause size={8} className="me-1"/> Paused</Badge>;
      case "Draft": return <Badge bg="secondary" className="rounded-pill px-3 py-1">Draft</Badge>;
      default: return <Badge bg="light" className="text-dark">{status}</Badge>;
    }
  };

  return (
    <div className="container-fluid py-4 bg-white min-vh-100">
      {loading && <div className="loader-overlay"><CircleLoader color="#16a34a" size={90} /></div>}

      <div className="mb-4 d-md-flex justify-content-between align-items-center bg-light p-3 rounded-4 border">
        <div>
          <h4 className="fw-bold text-success mb-1">🚀 Marketing Automation</h4>
          <p className="text-muted small mb-0">Abandoned cart recovery, campaign workflows, and customer re-engagement.</p>
        </div>
        <div className="d-flex gap-2 mt-3 mt-md-0">
           <Button variant="outline-dark" className="rounded-pill px-3 fw-bold small" onClick={fetchData}><FaRedo className="me-1"/> Refresh</Button>
           <Button variant="success" className="rounded-pill px-4 fw-bold shadow-sm"><FaRocket className="me-2"/> Create Campaign</Button>
        </div>
      </div>

      {/* Stats Row */}
      <Row className="g-3 mb-4">
        {[
          { title: "Total Carts", value: stats.totalCarts || 142, icon: <FaShoppingCart />, color: "#3b82f6", sub: "Tracked this week" },
          { title: "Abandoned", value: stats.abandonedCount || 38, icon: <FaBolt />, color: "#f43f5e", sub: "Needs recovery" },
          { title: "Recovery Rate", value: `${(stats.recoveryRate || 24.5).toFixed(1)}%`, icon: <FaChartLine />, color: "#16a34a", sub: "Conversion from nudge" },
          { title: "Campaigns Active", value: campaigns.filter(c => c.status === "Active").length, icon: <FaEnvelope />, color: "#8b5cf6", sub: "Running automations" },
        ].map((s, i) => (
          <Col xs={6} lg={3} key={i}>
            <Card className="shadow-sm rounded-4 border-0 h-100 overflow-hidden">
              <div style={{ height: '3px', background: s.color }} />
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="x-small fw-bold text-muted text-uppercase mb-1">{s.title}</div>
                    <h4 className="fw-bold mb-0">{s.value}</h4>
                  </div>
                  <div className="text-muted opacity-25" style={{fontSize: '1.5rem'}}>{s.icon}</div>
                </div>
                <div className="x-small text-muted fw-bold mt-1">{s.sub}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Campaign Workflows */}
      <Card className="shadow-sm rounded-4 border-0 overflow-hidden mb-4">
        <div className="p-3 px-4 border-bottom d-flex justify-content-between align-items-center">
           <h6 className="fw-bold mb-0">Campaign Workflows</h6>
           <Badge bg="light" className="text-muted border rounded-pill px-3 py-1 x-small fw-bold">{campaigns.length} Automations</Badge>
        </div>
        <div className="table-responsive">
          <Table hover className="mb-0 align-middle">
            <thead className="bg-light">
              <tr className="x-small text-uppercase text-muted fw-bold">
                <th className="ps-4">Campaign</th>
                <th>Channel</th>
                <th>Trigger</th>
                <th>Sent</th>
                <th>Converted</th>
                <th>Conv. Rate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map(c => (
                <tr key={c.id}>
                  <td className="ps-4">
                    <div className="fw-bold small">{c.name}</div>
                  </td>
                  <td><Badge bg="light" className="text-dark border x-small">{c.type}</Badge></td>
                  <td className="small text-muted">{c.trigger}</td>
                  <td className="small fw-bold">{c.sent.toLocaleString()}</td>
                  <td className="small fw-bold text-success">{c.converted.toLocaleString()}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <ProgressBar 
                        variant={c.rate > 20 ? "success" : c.rate > 10 ? "warning" : "danger"} 
                        now={c.rate} 
                        style={{height: 6, width: 60}} 
                        className="rounded-pill"
                      />
                      <span className="x-small fw-bold">{c.rate}%</span>
                    </div>
                  </td>
                  <td>{getStatusBadge(c.status)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>

      {/* Abandoned Cart Recovery */}
      <Card className="shadow-sm rounded-4 border-0 overflow-hidden">
        <div className="p-3 px-4 border-bottom bg-danger bg-opacity-10 d-flex justify-content-between align-items-center">
           <h6 className="fw-bold mb-0 text-danger d-flex align-items-center gap-2"><FaShoppingCart /> Abandoned Cart Recovery</h6>
           <Badge bg="danger" className="rounded-pill px-3">{abandonedCarts.length} Lost Carts</Badge>
        </div>
        <div className="table-responsive">
          <Table hover className="mb-0 align-middle">
            <thead className="bg-light">
              <tr className="x-small text-uppercase text-muted fw-bold">
                <th className="ps-4">Customer</th>
                <th>Items</th>
                <th>Cart Value</th>
                <th>Time Since</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {abandonedCarts.length > 0 ? abandonedCarts.map((cart) => (
                <tr key={cart.id}>
                  <td className="ps-4">
                    <div className="fw-bold small">{cart.user?.name || "Guest"}</div>
                    <div className="x-small text-muted">{cart.user?.email || "N/A"}</div>
                  </td>
                  <td className="small fw-bold">{cart.items?.length || 0} items</td>
                  <td className="small fw-bold text-success">
                    ₹{cart.items?.reduce((sum, i) => sum + (i.priceAtTime * i.quantity), 0).toLocaleString() || "0"}
                  </td>
                  <td className="small text-muted">
                    {Math.round((Date.now() - new Date(cart.updatedAt).getTime()) / (1000 * 60))} mins ago
                  </td>
                  <td className="text-center">
                    <Button variant="danger" size="sm" className="rounded-pill px-3 fw-bold shadow-sm" onClick={() => handleRecover(cart.id)}>
                      <FaBell size={10} className="me-1"/> Send Nudge
                    </Button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="text-center p-5">
                    <div className="text-muted">
                      <FaShoppingCart size={40} className="mb-3 opacity-25" />
                      <div className="fw-bold">No Abandoned Carts Right Now</div>
                      <div className="x-small">Customers are completing their checkouts! 🎉</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card>

      <style>{`
        .loader-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.85); z-index: 9999; }
        .x-small { font-size: 0.7rem; }
      `}</style>
    </div>
  );
};

export default MarketingAutomation;
