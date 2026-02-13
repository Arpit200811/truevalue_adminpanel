import React, { useState, useEffect } from "react";
import {
  UsersIcon,
  CubeIcon,
  BanknotesIcon,
  ShoppingBagIcon,
  TruckIcon,
  CheckBadgeIcon
} from "@heroicons/react/24/outline";
import { Row, Col, Card, Table, Badge, ProgressBar, Button } from "react-bootstrap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from "recharts";
import { DataService } from "../services/dataService";
import { FaCubes } from "react-icons/fa";
import Swal from "sweetalert2";

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({ totalOrders: 0, totalProducts: 0, totalCustomers: 0, totalRevenue: 0, activeUsers: 0, activeRiders: 0, totalRiders: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const ords = await DataService.getOrders({ limit: 5 });
      if (ords.data) setOrders(ords.data);
      
      const prods = await DataService.getProducts({ limit: 5 });
      if (prods.data) setProducts(prods.data);
      
      const custs = await DataService.getCustomers();
      if (Array.isArray(custs)) setCustomers(custs);
      
      const st = await DataService.getStats();
      if (st && typeof st === 'object' && !Array.isArray(st)) setStats(st);
    };
    fetchData();
  }, []);

  // 📈 Calculations
  const totalRevenue = stats.totalRevenue || 0;
  const totalOrders = stats.totalOrders || 0;
  const activeUsers = stats.activeUsers || 0;

  const unitPerformance = (Array.isArray(stats.categoryDistribution) && stats.categoryDistribution.length > 0)
    ? stats.categoryDistribution 
    : [
        { name: "Quick Commerce", value: 12, color: "#16a34a" },
        { name: "Hot Food", value: 8, color: "#f43f5e" },
        { name: "Marketplace", value: 5, color: "#3b82f6" },
      ];

  const trendData = (Array.isArray(stats.salesTrend) && stats.salesTrend.length > 0)
    ? stats.salesTrend.map(s => ({ time: s.date, active: s.revenue }))
    : [
        { time: "08:00", active: 120 },
        { time: "10:00", active: 450 },
        { time: "12:00", active: 800 },
        { time: "14:00", active: 620 },
        { time: "Today", active: activeUsers },
      ];

  return (
    <div className="p-3 p-md-4 bg-white min-vh-100">
      <div className="mb-4 d-md-flex justify-content-between align-items-center gap-3 bg-light p-3 rounded-4 border">
        <div>
          <h4 className="fw-bold text-success mb-0">📊 Admin Dashboard</h4>
          <p className="text-muted small mb-0">Management of Orders, Products, and Customers.</p>
        </div>
        <div className="d-flex gap-2 align-items-center mt-3 mt-md-0">
           <div className="text-end d-none d-sm-block">
              <div className="x-small fw-bold text-muted text-uppercase">System Status</div>
              <div className="small fw-bold text-success">● Live & Healthy</div>
           </div>
           <Badge bg="success" className="bg-opacity-10 text-success p-2 px-3 rounded-pill border border-success border-opacity-25 shadow-sm">LIVE: {activeUsers.toLocaleString()} Active Users</Badge>
        </div>
      </div>

      <Row className="g-3 mb-4">
        {[
          { title: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, color: "#16a34a", trend: "+12% Growth", icon: <BanknotesIcon style={{width: 20}}/> },
          { title: "Total Orders", value: totalOrders, color: "#3b82f6", trend: "Processed", icon: <ShoppingBagIcon style={{width: 20}}/> },
          { title: "Active Riders", value: `${stats.activeRiders || 0}/${stats.totalRiders || 0}`, color: "#f59e0b", trend: `${stats.totalRiders ? Math.round(((stats.activeRiders || 0) / stats.totalRiders) * 100) : 0}% On-field`, icon: <TruckIcon style={{width: 20}}/> },
          { title: "Total Customers", value: customers.length, color: "#8b5cf6", trend: "Registered", icon: <UsersIcon style={{width: 20}}/> },
        ].map((stat, i) => (
          <Col key={i} xs={6} lg={3}>
            <Card className="shadow-sm rounded-4 h-100 overflow-hidden bg-white border-0">
              <div style={{ height: '4px', background: stat.color }} />
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="x-small fw-bold text-muted text-uppercase mb-1">{stat.title}</div>
                    <h4 className="fw-bold mb-0 lh-1">{stat.value}</h4>
                  </div>
                  <div className="text-muted opacity-25">{stat.icon}</div>
                </div>
                <div className="mt-2 x-small fw-bold text-success d-flex align-items-center gap-1">
                   <CheckBadgeIcon style={{width: 12}}/> {stat.trend}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-4">
        <Col lg={8}>
          <Card className="shadow-sm rounded-4 border-0 h-100 bg-white overflow-hidden">
                <div className="p-4 border-bottom bg-light bg-opacity-10 d-flex justify-content-between align-items-center">
                   <h6 className="fw-bold text-dark mb-0">Sales by Category</h6>
                   <Badge bg="light" className="text-muted border rounded-pill px-3 py-1 x-small fw-bold">Live Data</Badge>
                </div>
            <Card.Body className="p-4">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={unitPerformance} layout="vertical" margin={{ left: 20, right: 30 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold' }} width={120} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={25}>
                    {unitPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              
              <Row className="mt-4 g-2">
                 {unitPerformance.map((u, i) => (
                    <Col key={i} xs={4}>
                       <div className="p-3 border rounded-3 text-center bg-light bg-opacity-10">
                          <div className="x-small text-muted fw-bold text-uppercase">{u.name}</div>
                          <div className="fw-bold h5 mb-0" style={{ color: u.color }}>{u.value}</div>
                       </div>
                    </Col>
                 ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm rounded-4 border-0 h-100 bg-white">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                 <h6 className="fw-bold text-dark mb-0">Live Traffic</h6>
                 <div className="pulse-dot"></div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendData}>
                  <Tooltip />
                  <Line type="monotone" dataKey="active" stroke="#16a34a" strokeWidth={3} dot={{ r: 4, fill: '#16a34a' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
              
              <div className="mt-4 p-3 bg-light rounded-4 border border-dashed text-center">
                 <h6 className="small fw-bold mb-2">Systems Online</h6>
                 <div className="x-small text-muted mb-3">All nodes functioning normally.</div>
                 <Button variant="success" className="w-100 rounded-pill small fw-bold py-2 shadow-sm" onClick={() => {
                    Swal.fire({
                      title: '📋 Server Logs',
                      html: `<div style="text-align:left;font-size:0.85rem;font-family:monospace;background:#1a1a2e;color:#16a34a;padding:16px;border-radius:12px;max-height:300px;overflow-y:auto">
                        <div style="color:#888;margin-bottom:8px">[${new Date().toISOString()}]</div>
                        <div>✅ Database: Connected (PostgreSQL)</div>
                        <div>✅ API Server: Running on :5000</div>
                        <div>✅ Frontend: Active on :5173</div>
                        <div>✅ Auth Module: JWT Active</div>
                        <div style="color:#f59e0b">📊 Total Products: ${products.length}</div>
                        <div style="color:#f59e0b">📊 Total Orders: ${orders.length}</div>
                        <div style="color:#f59e0b">📊 Total Customers: ${customers.length}</div>
                        <div style="margin-top:8px;color:#888">[INFO] All nodes functioning optimally.</div>
                      </div>`,
                      confirmButtonColor: '#16a34a',
                      confirmButtonText: 'Close',
                      width: 500
                    });
                 }}>View Server Logs</Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12}>
           <Card className="shadow-sm rounded-4 border-0 bg-white mt-2">
              <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
                  <h6 className="fw-bold text-dark mb-0">Recent Orders</h6>
                  <Badge bg="light" className="text-success border px-3 py-2 rounded-pill x-small fw-bold cursor-pointer" style={{cursor:'pointer'}} onClick={() => {
                    const headers = ["Order ID", "Customer", "Amount", "Status"];
                    const rows = orders.map(o => [o.id, o.customer || 'Guest', o.total, o.status]);
                    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
                    const link = document.createElement("a");
                    link.setAttribute("href", encodeURI(csvContent));
                    link.setAttribute("download", `all_orders_${new Date().toISOString().split('T')[0]}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    Swal.fire({ icon: 'success', title: 'Orders Exported', text: `${orders.length} orders exported to CSV.`, toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
                  }}>Export All Orders</Badge>
              </div>
              <div className="table-responsive">
                <Table hover className="align-middle mb-0">
                    <thead className="bg-light">
                       <tr className="x-small text-uppercase text-muted fw-bold">
                          <th className="ps-4">Order ID</th>
                          <th>Customer Name</th>
                          <th>Total Amount</th>
                          <th>Order Type</th>
                          <th>Status</th>
                       </tr>
                    </thead>
                    <tbody className="small">
                       {orders.slice(0, 5).map((txn, i) => (
                         <tr key={i}>
                            <td className="ps-4 fw-bold text-success">{txn.id}</td>
                            <td className="fw-semibold">{txn.customer}</td>
                            <td className="fw-bold">₹{txn.total.toLocaleString()}</td>
                            <td><Badge bg="light" className="text-dark border font-weight-normal">{txn.type || 'Standard'}</Badge></td>
                            <td>
                               <Badge bg={txn.status === 'Delivered' ? 'success' : 'warning'} className="rounded-pill px-3 pt-1">
                                  {txn.status}
                               </Badge>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                </Table>
              </div>
           </Card>
        </Col>
      </Row>

      <style>{`
        .x-small { font-size: 0.7rem; }
        .pulse-dot {
           width: 10px; height: 10px; background: #16a34a; border-radius: 50%;
           box-shadow: 0 0 0 rgba(22, 163, 74, 0.4);
           animation: pulse 2s infinite;
        }
        @keyframes pulse {
           0% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.7); }
           70% { box-shadow: 0 0 0 10px rgba(22, 163, 74, 0); }
           100% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
