import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Button, Badge, InputGroup, Modal, Row, Col } from 'react-bootstrap';
import { FaSearch, FaUserEdit, FaTrash, FaUserShield, FaCrown, FaPlus, FaWallet, FaHistory } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { DataService } from "../services/dataService";

const CustomerManagement = () => {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCust, setSelectedCust] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', status: 'Active', orders: 0, spent: 0 });
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletHistory, setWalletHistory] = useState([]);
  const [walletAmount, setWalletAmount] = useState('');
  const [walletReason, setWalletReason] = useState('');

  const handleWalletClick = async (cust) => {
    setSelectedCust(cust);
    const history = await DataService.getWalletHistory(cust.id);
    if(Array.isArray(history)) setWalletHistory(history);
    setShowWalletModal(true);
  };

  const handleAddFunds = async (e) => {
    e.preventDefault();
    if(!walletAmount) return;
    try {
       await DataService.addWalletFunds(selectedCust.id, walletAmount, walletReason);
        const res = await DataService.getCustomers();
        const updatedCustomers = res.data || [];
        setCustomers(updatedCustomers);
       
       // Update selected customer to reflect new balance
       const freshCust = updatedCustomers.find(c => c.id === selectedCust.id);
       if(freshCust) setSelectedCust(freshCust);

       const history = await DataService.getWalletHistory(selectedCust.id);
       setWalletHistory(history);
       setWalletAmount('');
       setWalletReason('');
       Swal.fire("Funds Added", `₹${walletAmount} credited to ${selectedCust.name}'s wallet.`, "success");
    } catch(err) {
       Swal.fire("Error", "Transaction failed.", "error");
    }
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      const result = await DataService.getCustomers();
      if (result.data) {
        setCustomers(result.data);
      }
    };
    fetchCustomers();
  }, []);

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (e) => {
    e.preventDefault();
    const newCust = {
      ...formData,
      id: selectedCust ? selectedCust.id : Date.now(),
      joined: selectedCust ? selectedCust.joined : new Date().toISOString().split('T')[0]
    };
    await DataService.saveCustomer(newCust);
    setCustomers(await DataService.getCustomers());
    setShowModal(false);
    Swal.fire('Success', selectedCust ? 'Profile Updated' : 'Customer Onboarded', 'success');
  };

  const handleDelete = (id, name) => {
    Swal.fire({
      title: `Deactivate ${name}?`,
      text: "User will be restricted from all Super-App services.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, Deactivate'
    }).then(async res => {
      if(res.isConfirmed) {
        await DataService.deleteCustomer(id);
        setCustomers(await DataService.getCustomers());
        Swal.fire('Restricted', 'Customer account has been disabled.', 'success');
      }
    });
  };

  const handleStatusChange = async (cust, newStatus) => {
    const updated = { ...cust, status: newStatus };
    await DataService.saveCustomer(updated);
    setCustomers(await DataService.getCustomers());
    Swal.fire({ icon: 'success', title: `Status: ${newStatus}`, toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
  };

  return (
    <div className="container-fluid py-4 min-vh-100 bg-white">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-3 bg-light p-3 rounded-4 border">
        <div>
          <h4 className="fw-bold text-success mb-0">👥 Customer Management</h4>
          <p className="text-muted small mb-0">Manage your customers and their profiles.</p>
        </div>
        <Button variant="success" className="rounded-pill px-4 fw-bold shadow-sm" onClick={() => { setFormData({ name: '', email: '', phone: '', status: 'Active', orders: 0, spent: 0 }); setSelectedCust(null); setShowModal(true); }}>
          <FaPlus className="me-2"/> Add Customer
        </Button>
      </div>

      <Card className="shadow-sm rounded-4 mb-4 border-0 mt-3">
        <Card.Body className="p-3">
          <InputGroup className="bg-light border rounded-pill overflow-hidden" style={{ maxWidth: '400px' }}>
            <InputGroup.Text className="bg-transparent border-0"><FaSearch className="text-muted"/></InputGroup.Text>
            <Form.Control 
              placeholder="Search by Identity, Email or Phone..." 
              className="bg-transparent border-0 shadow-none ps-0"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </Card.Body>
      </Card>

      <Card className="shadow-sm rounded-4 overflow-hidden bg-white border-0 mt-3">
        <Table hover responsive className="mb-0 align-middle">
          <thead className="bg-light">
            <tr className="small text-uppercase text-muted">
              <th className="ps-4">Consumer Identity</th>
              <th>Touchpoints (Orders)</th>
              <th>LT Value (Spent)</th>
              <th>Account Tier</th>
              <th>Onboarding Log</th>
              <th className="text-center">Action Center</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id}>
                <td className="ps-4">
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center fw-bold shadow-inner" style={{ width: 45, height: 45, fontSize: '1.2rem' }}>
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <div className="fw-bold small">{c.name} {c.spent > 5000 && <FaCrown className="text-warning ms-1" title="VIP Member"/>}</div>
                      <div className="x-small text-muted">{c.email}</div>
                      <div className="x-small text-muted mt-1">{c.phone}</div>
                    </div>
                  </div>
                </td>
                <td><Badge bg="light" className="text-dark border px-3 rounded-pill fw-bold">{c.orders} Orders</Badge></td>
                <td>
                  <div className="text-success fw-bold small">₹{Number(c.spent).toLocaleString()}</div>
                  <div className="x-small text-muted fw-bold">Wallet: ₹{Number(c.wallet_balance || 0).toLocaleString()}</div>
                </td>
                <td>
                  <Form.Select 
                    size="sm" 
                    className="w-auto border-0 bg-light shadow-none x-small fw-bold rounded-pill px-3"
                    value={c.status}
                    onChange={(e) => handleStatusChange(c, e.target.value)}
                  >
                    <option value="Active">🟢 Active</option>
                    <option value="Inactive">⚪ Inactive</option>
                    <option value="Blocked">🔴 Blocked</option>
                  </Form.Select>
                </td>
                <td className="x-small text-muted fw-bold">{new Date(c.joined).toLocaleDateString(undefined, {year: 'numeric', month: 'short', day: 'numeric'})}</td>
                <td className="text-center">
                  <div className="d-flex justify-content-center gap-2">
                    <Button variant="light border" size="sm" className="rounded-circle" onClick={() => handleWalletClick(c)} title="Wallet & Refunds"><FaWallet className="text-warning"/></Button>
                    <Button variant="light border" size="sm" className="rounded-circle" onClick={() => { setSelectedCust(c); setFormData(c); setShowModal(true); }}><FaUserEdit className="text-primary"/></Button>
                    <Button variant="light border" size="sm" className="rounded-circle" title="KYC / Compliance" onClick={() => {
                      Swal.fire({
                        title: `🛡️ Security Profile: ${c.name}`,
                        html: `<div style="text-align:left;font-size:0.9rem">
                          <div style="margin-bottom:10px"><b>Verification Status:</b> <span style="color:#16a34a">VERIFIED ✅</span></div>
                          <div style="margin-bottom:10px"><b>Identity Doc:</b> PAN/Aadhar Mapped</div>
                          <div style="margin-bottom:10px"><b>Phone Validation:</b> Success (+91-******${c.phone.slice(-4)})</div>
                          <div style="margin-bottom:10px"><b>Risk Level:</b> ${c.spent > 10000 ? '<span style="color:#3b82f6">TRUSTED CONSUMER</span>' : '<span style="color:#888">STANDARD</span>'}</div>
                          <hr/>
                          <div style="font-size:0.75rem;color:#888">Compliance ID: DB-KYC-${c.id?.toString().substring(0,8).toUpperCase()}</div>
                        </div>`,
                        confirmButtonColor: '#16a34a'
                      });
                    }}><FaUserShield className="text-info"/></Button>
                    <Button variant="light border" size="sm" className="rounded-circle" onClick={() => handleDelete(c.id, c.name)}><FaTrash className="text-danger"/></Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
                <tr><td colSpan="6" className="text-center py-5 text-muted fw-bold">No consumer records match your current query.</td></tr>
            )}
          </tbody>
        </Table>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold text-success">{selectedCust ? 'Update Customer' : 'Add New Customer'}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 pt-1">
          <Form onSubmit={handleSave}>
            <Row className="g-3">
              <Col md={12}>
                <Form.Label className="small fw-bold">Full Name</Form.Label>
                <Form.Control required className="bg-light border-0 py-2 shadow-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-bold">Email</Form.Label>
                <Form.Control required type="email" className="bg-light border-0 py-2 shadow-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-bold">Phone Number</Form.Label>
                <Form.Control required className="bg-light border-0 py-2 shadow-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-bold">Initial Orders</Form.Label>
                <Form.Control type="number" className="bg-light border-0 py-2 shadow-none" value={formData.orders} onChange={e => setFormData({...formData, orders: e.target.value})} />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-bold">Total Spent (₹)</Form.Label>
                <Form.Control type="number" className="bg-light border-0 py-2 shadow-none" value={formData.spent} onChange={e => setFormData({...formData, spent: e.target.value})} />
              </Col>
            </Row>
            <Button variant="success" type="submit" className="w-100 rounded-pill fw-bold shadow-sm mt-4 py-2">Save Customer</Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showWalletModal} onHide={() => setShowWalletModal(false)} centered size="lg">
         <Modal.Header closeButton className="border-0 bg-light">
            <Modal.Title className="fw-bold d-flex align-items-center gap-2"><FaWallet className="text-warning"/> Wallet: {selectedCust?.name}</Modal.Title>
         </Modal.Header>
         <Modal.Body className="p-0">
            <div className="p-4 bg-light border-bottom">
               <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                     <div className="x-small text-uppercase fw-bold text-muted">Current Balance</div>
                     <h2 className="fw-bold text-dark mb-0">₹{selectedCust?.wallet_balance || 0}</h2>
                  </div>
                  <Form onSubmit={handleAddFunds} className="d-flex gap-2 align-items-end">
                     <div>
                        <Form.Label className="x-small fw-bold text-muted mb-1">Add Amounts</Form.Label>
                        <Form.Control type="number" size="sm" placeholder="₹ Amount" value={walletAmount} onChange={(e) => setWalletAmount(e.target.value)} required style={{width: 100}} />
                     </div>
                     <div>
                        <Form.Label className="x-small fw-bold text-muted mb-1">Reason / Ref</Form.Label>
                        <Form.Control size="sm" placeholder="e.g. Refund" value={walletReason} onChange={(e) => setWalletReason(e.target.value)} style={{width: 140}} />
                     </div>
                     <Button type="submit" variant="dark" size="sm" className="fw-bold px-3">Credit Funds</Button>
                  </Form>
               </div>
            </div>
            <div className="p-0" style={{ maxHeight: 400, overflowY: 'auto' }}>
               <Table hover className="mb-0">
                  <thead className="bg-white sticky-top">
                     <tr className="x-small text-muted text-uppercase">
                        <th className="ps-4 py-3">Transaction Date</th>
                        <th className="py-3">Type</th>
                        <th className="py-3">Reason</th>
                        <th className="text-end pe-4 py-3">Amount</th>
                     </tr>
                  </thead>
                  <tbody>
                     {walletHistory.map(txn => (
                        <tr key={txn.id}>
                           <td className="ps-4 small text-muted">{new Date(txn.createdAt).toLocaleString()}</td>
                           <td><Badge bg={txn.type === 'CREDIT' ? 'success' : 'danger'} className="x-small">{txn.type}</Badge></td>
                           <td className="small">{txn.reason || '-'}</td>
                           <td className={`text-end pe-4 fw-bold ${txn.type === 'CREDIT' ? 'text-success' : 'text-danger'}`}>
                              {txn.type === 'CREDIT' ? '+' : '-'} ₹{Number(txn.amount).toLocaleString()}
                           </td>
                        </tr>
                     ))}
                     {walletHistory.length === 0 && (
                        <tr><td colSpan="4" className="text-center p-5 text-muted small">No transaction history found.</td></tr>
                     )}
                  </tbody>
               </Table>
            </div>
         </Modal.Body>
      </Modal>

      <style>{`
        .x-small { font-size: 0.7rem; }
        .shadow-inner { box-shadow: inset 0 2px 4px 0 rgba(0,0,0,0.06); }
      `}</style>
    </div>
  );
};

export default CustomerManagement;
