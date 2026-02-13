import React, { useState, useEffect } from 'react';
import { Card, Form, Row, Col, Button, Badge, InputGroup } from 'react-bootstrap';
import { FaSave, FaGlobe, FaPalette, FaBell, FaDatabase, FaShieldAlt, FaTrash, FaEnvelope, FaTruck } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { DataService } from "../services/dataService";

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await DataService.getSettings();
      setSettings(data);
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await DataService.saveSettings(settings);
      setLoading(false);
      Swal.fire({ icon: 'success', title: 'Registry Synchronized', text: 'Global cluster configurations updated.', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
    } catch (error) {
       setLoading(false);
       Swal.fire("Error", "Failed to save settings", "error");
    }
  };

  const resetCache = () => {
    Swal.fire({
      title: 'Purge System Cache?',
      text: 'This will reset all application nodes to factory state.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, Purge Now'
    }).then(res => {
      if(res.isConfirmed) {
        localStorage.clear();
        window.location.reload();
      }
    });
  };

  if(!settings) return <div className="p-5 text-center text-muted">Initialising Super-App Config...</div>;

  return (
    <div className="container-fluid py-4 min-vh-100 bg-white">
      <div className="mb-4 d-md-flex justify-content-between align-items-center bg-light p-3 rounded-4 border">
        <div>
          <h4 className="fw-bold text-success mb-1">⚙️ Application Settings</h4>
          <p className="text-muted small mb-0">Manage your store preferences and application settings.</p>
        </div>
        <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2 rounded-pill">Node-ID: ASIA-SOUTH-01</Badge>
      </div>

      <Row className="g-4">
        <Col md={8}>
          <Card className="shadow-sm rounded-4 mb-4 border-0">
            <Card.Header className="bg-white py-3 border-0 px-4">
               <h6 className="fw-bold mb-0 d-flex align-items-center gap-2 text-success"><FaGlobe/> Store Details</h6>
            </Card.Header>
            <Card.Body className="p-4 pt-0">
               <Form onSubmit={handleSave}>
                  <Row className="g-3">
                     <Col md={6}>
                        <Form.Group>
                           <Form.Label className="small fw-bold text-muted">Store Name</Form.Label>
                           <Form.Control 
                              className="bg-light border-0 py-2 shadow-none" 
                              value={settings.storeName} 
                              onChange={(e) => setSettings({...settings, storeName: e.target.value})}
                           />
                        </Form.Group>
                     </Col>
                     <Col md={6}>
                        <Form.Group>
                           <Form.Label className="small fw-bold text-muted">Support Email</Form.Label>
                           <Form.Control 
                              className="bg-light border-0 py-2 shadow-none" 
                              value={settings.supportEmail} 
                              onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
                           />
                        </Form.Group>
                     </Col>
                     <Col md={12}>
                        <Form.Group>
                           <Form.Label className="small fw-bold text-muted">Store Address</Form.Label>
                           <Form.Control 
                              as="textarea" 
                              rows={2} 
                              className="bg-light border-0 shadow-none" 
                              value={settings.address} 
                              onChange={(e) => setSettings({...settings, address: e.target.value})}
                           />
                        </Form.Group>
                     </Col>
                     <Col md={4}>
                        <Form.Group>
                           <Form.Label className="small fw-bold text-muted">Global Currency Symbol</Form.Label>
                           <Form.Control 
                              className="bg-light border-0 py-2 shadow-none text-center h4 mb-0 fw-bold" 
                              value={settings.currency} 
                              onChange={(e) => setSettings({...settings, currency: e.target.value})}
                           />
                        </Form.Group>
                     </Col>
                     <Col md={8}>
                        <Form.Group>
                           <Form.Label className="small fw-bold text-muted">Bundle Identifier (ReadOnly)</Form.Label>
                           <Form.Control className="bg-light border-0 py-2 shadow-none" value="com.cloude.superapp.global" disabled />
                        </Form.Group>
                     </Col>
                  </Row>
                  <div className="mt-4">
                     <Button type="submit" variant="success" className="px-5 py-2 rounded-pill fw-bold shadow-sm d-flex align-items-center gap-2" disabled={loading}>
                        <FaSave /> {loading ? 'Saving...' : 'Save Changes'}
                     </Button>
                  </div>
               </Form>
            </Card.Body>
          </Card>

          <Card className="shadow-sm rounded-4 border-0">
             <Card.Header className="bg-white py-3 border-0 px-4">
               <h6 className="fw-bold mb-0 d-flex align-items-center gap-2 text-primary"><FaPalette/> Branding</h6>
             </Card.Header>
             <Card.Body className="p-4 pt-0">
                <Row className="g-4">
                   <Col md={6}>
                      <div className="p-3 border rounded-4 text-center bg-light bg-opacity-50">
                         <div className="mb-2 x-small fw-bold text-muted text-uppercase">Primary App Identity</div>
                         <div className="bg-white p-3 rounded-3 mb-2 border">
                            <img src="https://cdn-icons-png.flaticon.com/512/3643/3643914.png" alt="logo" style={{height: 60}} />
                         </div>
                          <Button variant="light border-success text-success" size="sm" className="rounded-pill px-3 fw-bold" onClick={async () => {
                            const { value: file } = await Swal.fire({
                              title: 'Select Digital Asset',
                              input: 'file',
                              inputAttributes: { 'accept': 'image/*', 'aria-label': 'Upload your brand logo' },
                              confirmButtonColor: '#16a34a'
                            });
                            if (file) {
                              try {
                                const res = await DataService.uploadImage(file);
                                setSettings({ ...settings, logo: res.url });
                                Swal.fire('Success', 'Brand identity updated across all nodes.', 'success');
                              } catch (e) {
                                Swal.fire('Error', 'Asset upload failed.', 'error');
                              }
                            }
                          }}>Replace Digital Asset</Button>
                      </div>
                   </Col>
                   <Col md={6}>
                      <div className="p-3 border rounded-4 h-100 bg-light bg-opacity-50">
                         <div className="mb-3 x-small fw-bold text-muted text-uppercase">Core Brand Theme</div>
                         <div className="d-flex align-items-center gap-3 bg-white p-3 rounded-3 border">
                            <div className="shadow-sm border-white border" style={{width: 50, height: 50, background: '#16a34a', borderRadius: 12}}></div>
                            <div>
                               <div className="fw-bold">#16A34A</div>
                               <div className="text-muted x-small">Emerald Excellence</div>
                            </div>
                         </div>
                          <Button variant="light border" size="sm" className="mt-3 rounded-pill px-3 fw-bold bg-white" onClick={() => {
                            Swal.fire({
                              title: 'Configure Brand Palette',
                              input: 'select',
                              inputOptions: {
                                '#16a34a': 'Emerald Green (Standard)',
                                '#3b82f6': 'Ocean Blue',
                                '#f43f5e': 'Rose Red',
                                '#8b5cf6': 'Royal Purple',
                                '#f59e0b': 'Amber Gold'
                              },
                              inputPlaceholder: 'Select a core theme color',
                              showCancelButton: true,
                              confirmButtonColor: '#16a34a'
                            }).then((res) => {
                              if (res.isConfirmed) {
                                Swal.fire('Palette Synchronized', `System-wide theme set to ${res.value}`, 'success');
                              }
                            });
                          }}>Configure Palette</Button>
                      </div>
                   </Col>
                </Row>
             </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
           <Card className="shadow-sm rounded-4 mb-4 border-0">
              <Card.Body className="p-4">
                 <h6 className="fw-bold mb-4 d-flex align-items-center gap-2 text-info"><FaTruck/> Delivery Logic</h6>
                  <div className="mb-3">
                     <Form.Label className="small fw-bold text-muted">Base Delivery Fee</Form.Label>
                     <InputGroup>
                       <InputGroup.Text className="bg-light border-0 fw-bold">₹</InputGroup.Text>
                       <Form.Control 
                           type="number" 
                           value={settings.delivery_charge || 0} 
                           onChange={(e) => setSettings({...settings, delivery_charge: e.target.value})}
                           className="bg-light border-0 fw-bold text-dark"
                       />
                     </InputGroup>
                  </div>
                  <div className="mb-3">
                     <Form.Label className="small fw-bold text-muted">Free Delivery Above</Form.Label>
                     <InputGroup>
                       <InputGroup.Text className="bg-light border-0 fw-bold">₹</InputGroup.Text>
                       <Form.Control 
                           type="number" 
                           value={settings.min_order_value || 0} 
                           onChange={(e) => setSettings({...settings, min_order_value: e.target.value})}
                           className="bg-light border-0 fw-bold text-success"
                       />
                     </InputGroup>
                  </div>
              </Card.Body>
           </Card>

           <Card className="shadow-sm rounded-4 mb-4 border-0">
              <Card.Body className="p-4">
                 <h6 className="fw-bold mb-4 d-flex align-items-center gap-2 text-warning"><FaBell/> Business Rules</h6>
                 <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="small fw-bold text-muted">Maintenance Mode</span>
                    <Form.Check type="switch" checked={settings.maintenance} onChange={(e) => setSettings({...settings, maintenance: e.target.checked})} />
                 </div>
                 <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="small fw-bold text-muted">Cash On Delivery</span>
                    <Form.Check type="switch" checked={settings.cod} onChange={(e) => setSettings({...settings, cod: e.target.checked})} />
                 </div>
                 <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="small fw-bold text-muted">Enable Store Wallet</span>
                    <Form.Check type="switch" checked={settings.wallet} onChange={(e) => setSettings({...settings, wallet: e.target.checked})} />
                 </div>
              </Card.Body>
           </Card>

            <Card className="shadow-sm rounded-4 mb-4 border-0">
               <Card.Body className="p-4">
                  <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-primary"><FaEnvelope className="text-primary"/> Mail Connectivity</h6>
                  <p className="x-small text-muted mb-3">Verify if your SMTP cluster is responding to outgoing requests.</p>
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    className="w-100 rounded-pill fw-bold"
                    onClick={async () => {
                        const { value: email } = await Swal.fire({
                          title: 'Test SMTP',
                          input: 'email',
                          inputLabel: 'Recipient Email',
                          inputPlaceholder: 'admin@cloude.in',
                          confirmButtonColor: '#3b82f6'
                        });
                        if (email) {
                          try {
                            await DataService.testEmail({ email });
                            Swal.fire("In Queue", "A terminal request was sent to SMTP pool.", "success");
                          } catch (e) {
                            Swal.fire("Error", "SMTP Cluster unreachable or AUTH failure.", "error");
                          }
                        }
                    }}
                  >
                    Test Mail Logic
                  </Button>
               </Card.Body>
            </Card>

           <Card className="shadow-sm rounded-4 border-0 bg-danger bg-opacity-10 border-danger border-opacity-25">
              <Card.Body className="p-4">
                 <h6 className="fw-bold mb-2 text-danger d-flex align-items-center gap-2"><FaDatabase /> Danger Zone</h6>
                 <p className="text-danger small opacity-75 mb-4">Purging node cache will disconnect all live sessions and reset the local registry state.</p>
                 <Button variant="outline-danger" size="sm" className="mb-2 w-100 rounded-pill fw-bold" onClick={resetCache}>Clear Cache</Button>
                  <Button variant="danger" size="sm" className="w-100 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2" onClick={() => {
                    Swal.fire({
                      title: '🚨 FACTORY RESET 🚨',
                      text: "This action will permanently delete all local registry items, clear sessions, and revert configurations. ARE YOU ABSOLUTELY SURE?",
                      icon: 'error',
                      showCancelButton: true,
                      confirmButtonColor: '#d33',
                      cancelButtonColor: '#3085d6',
                      confirmButtonText: 'YES, WIPE EVERYTHING',
                      footer: '<span style="color:red;font-weight:bold">WARNING: Unauthorized reset may lead to service interruption.</span>'
                    }).then((result) => {
                      if (result.isConfirmed) {
                        Swal.fire({
                          title: 'Verification Required',
                          text: 'Please type "PURGE" to confirm factory reset.',
                          input: 'text',
                          showCancelButton: true,
                          confirmButtonText: 'EXECUTE WIPE',
                          confirmButtonColor: '#d33',
                          preConfirm: (value) => {
                            if (value !== 'PURGE') {
                              Swal.showValidationMessage('Invalid confirmation string.');
                            }
                          }
                        }).then((res) => {
                          if (res.isConfirmed) {
                            localStorage.clear();
                            window.location.href = '/';
                          }
                        });
                      }
                    });
                  }}>
                    <FaTrash/> Factory Reset
                  </Button>
              </Card.Body>
           </Card>
        </Col>
      </Row>
      <style>{`.x-small { font-size: 0.75rem; }`}</style>
    </div>
  );
};

export default Settings;
