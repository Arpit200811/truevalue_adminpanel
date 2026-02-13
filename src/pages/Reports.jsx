import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Form, Button, Badge, Tab, Nav } from 'react-bootstrap';
import { 
  FaDownload, 
  FaCalendarAlt, 
  FaChartArea, 
  FaWallet, 
  FaUsers, 
  FaArrowUp, 
  FaBolt,
  FaFilter
} from 'react-icons/fa';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { DataService } from "../services/dataService";

const Reports = () => {
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const ords = await DataService.getOrders();
      if (Array.isArray(ords)) setOrders(ords);

      const st = await DataService.getStats();
      if (st) setStats(st);
    };
    fetchData();
  }, []);

  const totalRevenue = stats.totalRevenue || orders.filter(o => o.status === 'Delivered').reduce((acc, curr) => acc + Number(curr.total), 0);
  const totalOrders = stats.totalOrders || orders.length;

  const revenueData = stats.salesTrend?.length > 0
    ? stats.salesTrend
    : [
        { date: '01 Nov', revenue: 45000 },
        { date: 'Today', revenue: totalRevenue },
      ];

  const nichePerformance = stats.categoryDistribution?.length > 0
    ? stats.categoryDistribution
    : [
        { name: "Grocery", value: 35, color: "#16a34a" },
        { name: "Food", value: 25, color: "#f43f5e" },
        { name: "Electronics", value: 40, color: "#3b82f6" },
      ];

  return (
    <div className="container-fluid py-4 min-vh-100 bg-white">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-3 bg-light p-3 rounded-4 border">
        <div>
          <h4 className="fw-bold text-success mb-1">📈 Reports & Analytics</h4>
          <p className="text-muted small mb-0">Detailed analysis of sales, revenue and performance.</p>
        </div>
        <div className="d-flex gap-2">
           <Form.Select size="sm" className="rounded-pill px-3 border-0 shadow-sm" style={{width: '180px'}} value={dateRange} onChange={e => setDateRange(e.target.value)}>
              <option>Real-time (LIVE)</option>
              <option>Last 24 Hours</option>
              <option>Last 30 Days</option>
              <option>Fiscal Year 2024</option>
           </Form.Select>
           <Button variant="success" size="sm" className="rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2">
              <FaDownload /> Global PDF Export
           </Button>
        </div>
      </div>

      <Row className="g-3 mb-4">
         {[
           { label: "Consolidated Revenue", value: `₹${totalRevenue.toLocaleString()}`, trend: "+12.5%", color: "#16a34a", icon: <FaWallet/> },
           { label: "Transmission Load", value: totalOrders, trend: "Processing", color: "#3b82f6", icon: <FaBolt/> },
           { label: "Avg. Transaction Value", value: `₹${(totalRevenue / (totalOrders || 1)).toFixed(0)}`, trend: "+2.1%", color: "#f59e0b", icon: <FaChartArea/> },
         ].map((card, idx) => (
           <Col lg={4} key={idx}>
             <Card className="shadow-sm rounded-4 h-100 p-3">
                <Card.Body className="d-flex align-items-center gap-3">
                   <div className="p-3 rounded-4" style={{background: `${card.color}15`, color: card.color}}>
                      {card.icon}
                   </div>
                   <div>
                      <div className="text-muted x-small fw-bold text-uppercase mb-1">{card.label}</div>
                      <h4 className="fw-bold mb-0">{card.value}</h4>
                      <span className="text-success x-small fw-bold">
                         <FaArrowUp className="me-1"/> 100% Real-time Log
                      </span>
                   </div>
                </Card.Body>
             </Card>
           </Col>
         ))}
      </Row>

      <Row className="g-4 mb-4">
         <Col lg={8}>
            <Tab.Container defaultActiveKey="revenue">
               <Card className="shadow-sm rounded-4 p-4 border-0">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                     <h6 className="fw-bold mb-0">Market Performance Matrix</h6>
                     <Nav variant="pills" className="bg-light p-1 rounded-pill">
                        <Nav.Item><Nav.Link eventKey="revenue" className="rounded-pill py-1 px-3 small fw-bold">Revenue Graph</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link eventKey="units" className="rounded-pill py-1 px-3 small fw-bold">Unit Sales</Nav.Link></Nav.Item>
                     </Nav>
                  </div>
                  <Tab.Content>
                     <Tab.Pane eventKey="revenue">
                        <ResponsiveContainer width="100%" height={300}>
                           <AreaChart data={revenueData}>
                              <defs>
                                 <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                                 </linearGradient>
                              </defs>
                              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                              <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                              <Area type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                           </AreaChart>
                        </ResponsiveContainer>
                     </Tab.Pane>
                  </Tab.Content>
               </Card>
            </Tab.Container>
         </Col>
         <Col lg={4}>
            <Card className="shadow-sm rounded-4 p-4 h-100 border-0">
               <h6 className="fw-bold mb-4">Vertical Share (%)</h6>
               <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={nichePerformance}>
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                     <Tooltip cursor={{fill: 'transparent'}} />
                     <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                        {nichePerformance.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
               <div className="mt-4">
                  {nichePerformance.map((n, i) => (
                     <div key={i} className="d-flex align-items-center justify-content-between mb-2">
                        <div className="d-flex align-items-center gap-2">
                           <div style={{width: 8, height: 8, borderRadius: '50%', background: n.color}}></div>
                           <span className="x-small fw-bold">{n.name}</span>
                        </div>
                        <span className="x-small fw-bold">{n.value}%</span>
                     </div>
                  ))}
               </div>
            </Card>
         </Col>
      </Row>

      <Card className="border shadow-sm rounded-4 p-4">
         <div className="d-flex justify-content-between align-items-center mb-4">
            <h6 className="fw-bold mb-0">Fulfillment Efficiency</h6>
            <Badge bg="success" className="bg-opacity-10 text-success x-small px-3 border">Live Status</Badge>
         </div>
         <Row className="g-3 text-center">
            {[
               { label: "Quick Commerce", value: "98.2%", color: "#16a34a", sub: "Avg: 9.2 mins" },
               { label: "Food Delivery", value: "94.5%", color: "#f43f5e", sub: "Avg: 22 mins" },
               { label: "Marketplace", value: "99.1%", color: "#3b82f6", sub: "Next-Day Delivery" },
               { label: "Pharma", value: "92.0%", color: "#06b6d4", sub: "Avg: 2 hours" },
            ].map((item, i) => (
               <Col md={3} key={i}>
                  <div className="p-3 bg-light rounded-4 border">
                     <h6 className="x-small text-muted mb-2 fw-bold text-uppercase">{item.label}</h6>
                     <h4 className="fw-bold mb-1" style={{color: item.color}}>{item.value}</h4>
                     <div className="x-small opacity-75">{item.sub}</div>
                  </div>
               </Col>
            ))}
         </Row>
      </Card>

      <style>{`.x-small { font-size: 0.7rem; }`}</style>
    </div>
  );
};

export default Reports;
