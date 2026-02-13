import React, { useState, useEffect } from "react";
import { Card, Row, Col, Badge, Button, Form, ProgressBar, InputGroup } from "react-bootstrap";
import { FaMapMarkedAlt, FaPlus, FaBolt, FaTrash, FaLocationArrow, FaDrawPolygon, FaLayerGroup } from "react-icons/fa";
import Swal from "sweetalert2";
import CircleLoader from "react-spinners/CircleLoader";
import { DataService } from "../services/dataService";

const ZoneManagement = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeZone, setActiveZone] = useState(null);

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    setLoading(true);
    const data = await DataService.getZones();
    setZones(data);
    if (data.length > 0) setActiveZone(data[0]);
    setLoading(false);
  };

  const handleToggleSurge = async (zoneId, currentActive, multiplier) => {
    try {
      await DataService.toggleSurge(zoneId, !currentActive, multiplier);
      fetchZones();
      Swal.fire({
        title: !currentActive ? "Surge Activated! ⚡" : "Surge Deactivated",
        text: `Pricing updated for the selected region.`,
        icon: "info",
        position: 'top-end',
        toast: true,
        showConfirmButton: false,
        timer: 3000
      });
    } catch (error) {
      Swal.fire("Error", "Failed to update surge settings", "error");
    }
  };

  const addZone = () => {
    Swal.fire({
      title: 'Define New Delivery Cluster',
      html: `
        <input id="swal-input1" class="swal2-input" placeholder="Zone Name (e.g. DLF Phase 3)">
        <input id="swal-input2" class="swal2-input" placeholder="Base Delivery Fee (₹)">
        <input id="swal-input3" class="swal2-input" placeholder="Radius (KM)">
      `,
      focusConfirm: false,
      preConfirm: () => {
        return {
          name: document.getElementById('swal-input1').value,
          base_fee: document.getElementById('swal-input2').value,
          radius_km: document.getElementById('swal-input3').value,
          latitude: 28.4595, // Default for demo
          longitude: 77.0266
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        await DataService.saveZone(result.value);
        fetchZones();
      }
    });
  };

  return (
    <div className="container-fluid py-4 bg-white min-vh-100">
      {loading && <div className="loader-overlay"><CircleLoader color="#16a34a" size={90} /></div>}

      <div className="mb-4 d-md-flex justify-content-between align-items-center bg-light p-3 rounded-4 border">
        <div>
          <h4 className="fw-bold text-success mb-1">📍 Geo-Fencing & Delivery Zones</h4>
          <p className="text-muted small mb-0">Define service areas, set surge pricing, and manage local logistics.</p>
        </div>
        <Button variant="success" className="rounded-pill px-4 fw-bold shadow-sm" onClick={addZone}>
          <FaPlus className="me-2"/> Create Zone Cluster
        </Button>
      </div>

      <Row className="g-4">
        {/* Zone List */}
        <Col lg={4}>
          <Card className="shadow-sm rounded-4 border-0 h-100 overflow-hidden">
            <Card.Header className="bg-white py-3 border-0">
               <h6 className="fw-bold mb-0 text-muted text-uppercase x-small letter-spacing-1">Active Clusters</h6>
            </Card.Header>
            <div className="zone-list-container" style={{maxHeight: '600px', overflowY: 'auto'}}>
              {zones.map(zone => (
                <div 
                  key={zone.id} 
                  className={`zone-item p-3 border-bottom cursor-pointer transition-all ${activeZone?.id === zone.id ? 'active-zone bg-success bg-opacity-10 border-start border-success border-4' : 'bg-white'}`}
                  onClick={() => setActiveZone(zone)}
                >
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="fw-bold mb-0">{zone.name}</h6>
                    {zone.surge_price_active && <Badge bg="danger" className="pulse-surge"><FaBolt size={8} /> SURGE</Badge>}
                  </div>
                  <div className="d-flex gap-3 x-small text-muted fw-bold">
                    <span><FaLocationArrow size={10} className="me-1"/> {zone.radius_km}KM RADIUS</span>
                    <span>₹{zone.base_fee} BASE FEE</span>
                  </div>
                </div>
              ))}
              {zones.length === 0 && <div className="p-4 text-center text-muted">No zones defined yet.</div>}
            </div>
          </Card>
        </Col>

        {/* Map & Detail Command Center */}
        <Col lg={8}>
          <Card className="shadow-sm rounded-4 border-0 h-100 overflow-hidden">
             <div className="position-relative" style={{height: '350px', background: '#f8fafc'}}>
                {/* Mock Map Background */}
                <div className="mock-map-bg h-100 w-100 d-flex align-items-center justify-content-center">
                    <div className="position-relative">
                        <div className="map-grid-overlay"></div>
                        <div className="map-node main-node"></div>
                        {activeZone && (
                            <div className="zone-visual-circle" style={{
                                width: Math.min(activeZone.radius_km * 40, 300) + 'px', 
                                height: Math.min(activeZone.radius_km * 40, 300) + 'px'
                            }}>
                                <span className="zone-label-floating bg-success text-white rounded-pill px-2 py-1 x-small shadow-sm">
                                    {activeZone.name}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="map-toolbar position-absolute top-0 end-0 p-3">
                   <div className="d-flex flex-column gap-2">
                      <Button variant="white" className="rounded-circle shadow-sm border-0"><FaLayerGroup /></Button>
                      <Button variant="white" className="rounded-circle shadow-sm border-0 active text-success"><FaDrawPolygon /></Button>
                   </div>
                </div>
             </div>

             <Card.Body className="p-4">
               {activeZone ? (
                 <>
                   <div className="d-flex justify-content-between align-items-start mb-4">
                      <div>
                         <h4 className="fw-bold mb-1">{activeZone.name}</h4>
                         <p className="text-muted small">Cluster ID: CLSTR-{activeZone.id}</p>
                      </div>
                      <div className="d-flex gap-2">
                         <Button variant="light white" className="border shadow-none rounded-pill px-3 py-2 small fw-bold" onClick={() => {
                            Swal.fire({
                                title: 'Delete Zone?',
                                text: 'Riders in this area will no longer receive orders.',
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonColor: '#d33'
                            }).then(async r => {
                                if(r.isConfirmed) {
                                    await DataService.deleteZone(activeZone.id);
                                    fetchZones();
                                }
                            });
                         }}>
                            <FaTrash className="text-danger me-2" /> Remove Cluster
                         </Button>
                      </div>
                   </div>

                   <Row className="g-4">
                      <Col md={6}>
                         <div className="p-4 rounded-4 border bg-light bg-opacity-50">
                            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2"><FaBolt className="text-warning"/> Surge Control</h6>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                               <span className="small fw-bold text-muted">Intelligent Surge Pricing</span>
                               <Form.Check 
                                 type="switch" 
                                 checked={activeZone.surge_price_active}
                                 onChange={() => handleToggleSurge(activeZone.id, activeZone.surge_price_active, activeZone.surge_multiplier)}
                               />
                            </div>
                            <Form.Group className="mt-3">
                               <Form.Label className="x-small fw-bold text-uppercase text-muted">Price Multiplier</Form.Label>
                               <InputGroup size="sm">
                                  <Form.Range 
                                    min="1" 
                                    max="3" 
                                    step="0.1" 
                                    value={activeZone.surge_multiplier} 
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        setZones(zones.map(z => z.id === activeZone.id ? {...z, surge_multiplier: val} : z));
                                        setActiveZone({...activeZone, surge_multiplier: val});
                                    }}
                                  />
                                  <Badge bg="danger" className="ms-2 px-3 py-2 rounded-pill shadow-sm">{activeZone.surge_multiplier}x</Badge>
                               </InputGroup>
                            </Form.Group>
                         </div>
                      </Col>
                      <Col md={6}>
                         <div className="p-4 rounded-4 border bg-white shadow-sm h-100">
                            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-success">Logistic Rules</h6>
                            <div className="mb-3">
                               <div className="d-flex justify-content-between mb-1">
                                  <span className="x-small fw-bold text-muted text-uppercase">Rider Capacity</span>
                                  <span className="x-small fw-bold text-success">84% FULL</span>
                               </div>
                               <ProgressBar variant="success" now={84} style={{height: 6}} className="rounded-pill" />
                            </div>
                            <div className="d-flex justify-content-between align-items-center pt-2">
                               <div className="text-start">
                                  <div className="x-small text-muted fw-bold">BASE FEE</div>
                                  <div className="fw-bold h5 mb-0">₹{activeZone.base_fee}</div>
                                </div>
                                <div className="text-end">
                                  <div className="x-small text-muted fw-bold">MAX RADIUS</div>
                                  <div className="fw-bold h5 mb-0 text-primary">{activeZone.radius_km}KM</div>
                                </div>
                            </div>
                         </div>
                      </Col>
                   </Row>
                 </>
               ) : (
                 <div className="h-100 d-flex align-items-center justify-content-center flex-column text-muted opacity-50">
                    <FaMapMarkedAlt size={60} className="mb-3" />
                    <h5 className="fw-bold">Select a Cluster to Inspect</h5>
                 </div>
               )}
             </Card.Body>
          </Card>
        </Col>
      </Row>

      <style>{`
        .loader-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.85); z-index: 9999; }
        .x-small { font-size: 0.7rem; }
        .letter-spacing-1 { letter-spacing: 1px; }
        .cursor-pointer { cursor: pointer; }
        .transition-all { transition: all 0.3s ease; }
        
        .zone-item:hover { background: #f8fafc; }
        .active-zone { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        
        .mock-map-bg {
           background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
           background-size: 30px 30px;
           overflow: hidden;
        }
        
        .main-node {
           width: 12px; height: 12px; background: #16a34a; border-radius: 50%;
           box-shadow: 0 0 0 10px rgba(22,163,74,0.1);
           z-index: 5;
        }
        
        .zone-visual-circle {
           position: absolute;
           top: 50%; left: 50%;
           transform: translate(-50%, -50%);
           border: 2px dashed #16a34a;
           border-radius: 50%;
           background: rgba(22,163,74,0.05);
           transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .zone-label-floating {
           position: absolute;
           top: -10px; right: 20%;
           white-space: nowrap;
        }
        
        .pulse-surge {
           animation: pulse-red 2s infinite;
        }
        
        @keyframes pulse-red {
           0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
           70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
           100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
        }
      `}</style>
    </div>
  );
};

export default ZoneManagement;
