import React, { useState, useEffect } from "react";
import { FaTrash, FaPercentage, FaTag, FaImage, FaPlus } from "react-icons/fa";
import { Row, Col, Card, Badge, Button, Tabs, Tab, Modal, Form } from "react-bootstrap";
import Swal from "sweetalert2";
import { DataService } from "../services/dataService";

const OfferManagement = () => {
  const [offers, setOffers] = useState([]);
  const [banners, setBanners] = useState([]);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);
  
  const [couponForm, setCouponForm] = useState({ title: '', code: '', discount: '', type: 'Percent', active: true });
  const [bannerForm, setBannerForm] = useState({ title: '', image: '', active: true });

  useEffect(() => {
    const fetchData = async () => {
      const offrs = await DataService.getOffers();
      if (Array.isArray(offrs)) setOffers(offrs);
      
      const bnrs = await DataService.getBanners();
      if (Array.isArray(bnrs)) setBanners(bnrs);
    };
    fetchData();
  }, []);

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    const newOffer = { ...couponForm, id: Date.now() };
    await DataService.saveOffer(newOffer);
    setOffers(await DataService.getOffers());
    setShowCouponModal(false);
    setCouponForm({ title: '', code: '', discount: '', type: 'Percent', active: true });
    Swal.fire('Success', 'Coupon created successfully!', 'success');
  };

  const handleBannerSubmit = async (e) => {
    e.preventDefault();
    const newBanner = { ...bannerForm, id: Date.now() };
    await DataService.saveBanner(newBanner);
    setBanners(await DataService.getBanners());
    setShowBannerModal(false);
    setBannerForm({ title: '', image: '', active: true });
    Swal.fire('Success', 'Banner published successfully!', 'success');
  };

  const toggleOffer = async (offer) => {
    const updated = { ...offer, active: !offer.active };
    await DataService.saveOffer(updated);
    setOffers(await DataService.getOffers());
    Swal.fire({ icon: 'success', title: `Coupon ${updated.active ? 'Activated' : 'Paused'}`, toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
  };

  const deleteOffer = (id) => {
    Swal.fire({ title: 'Delete Coupon?', text: "Users won't be able to apply this code anymore.", icon: 'warning', showCancelButton: true }).then(async r => {
      if(r.isConfirmed) {
        await DataService.deleteOffer(id);
        setOffers(await DataService.getOffers());
        Swal.fire('Removed', 'Coupon deleted from registry.', 'success');
      }
    });
  };

  const toggleBanner = async (banner) => {
      const updated = { ...banner, active: !banner.active };
      await DataService.saveBanner(updated);
      setBanners(await DataService.getBanners());
      Swal.fire({ icon: 'success', title: `Banner ${updated.active ? 'Published' : 'Hidden'}`, toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
  };

  const deleteBanner = (id) => {
      Swal.fire({ title: 'Delete Banner?', text: "This banner will be removed from App Home.", icon: 'warning', showCancelButton: true }).then(async r => {
        if(r.isConfirmed) {
          await DataService.deleteBanner(id);
          setBanners(await DataService.getBanners());
          Swal.fire('Removed', 'Banner space cleared.', 'success');
        }
      });
  };

  return (
    <div className="container-fluid py-4 min-vh-100 bg-white">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-3 bg-light p-3 rounded-4 border">
        <div>
          <h4 className="fw-bold text-success mb-0">🎁 Offers & Coupons</h4>
          <p className="text-muted small mb-0">Manage discount coupons and app banners.</p>
        </div>
        <div className="d-flex gap-2 mt-3 mt-md-0">
            <Button variant="white" className="rounded-pill px-3 fw-bold shadow-sm border" onClick={() => setShowCouponModal(true)}>+ New Coupon</Button>
            <Button variant="success" className="rounded-pill px-3 fw-bold shadow-sm" onClick={() => setShowBannerModal(true)}>+ New Banner</Button>
        </div>
      </div>

      <Tabs defaultActiveKey="offers" className="mb-4 custom-tabs border-0">
        <Tab eventKey="offers" title={<span><FaTag className="me-2"/>Active Coupons</span>}>
          <Row className="g-4">
            {offers.map(offer => (
              <Col lg={4} md={6} key={offer.id}>
                <Card className="shadow-sm rounded-4 overflow-hidden border-0 bg-white coupon-card">
                  <Card.Body className="p-0 d-flex">
                    <div className="coupon-edge bg-success text-white p-3 d-flex flex-column align-items-center justify-content-center" style={{ width: '80px' }}>
                       <FaPercentage size={24} className="mb-2 opacity-50"/>
                       <div className="fw-bold h5 mb-0">{offer.discount}</div>
                    </div>
                    <div className="p-4 flex-grow-1">
                       <div className="d-flex justify-content-between align-items-start mb-2">
                         <h6 className="fw-bold text-dark mb-0">{offer.title}</h6>
                         <Badge bg={offer.active ? "success" : "light"} className={offer.active ? "bg-opacity-10 text-success border border-success border-opacity-25" : "text-muted border"}>
                            {offer.active ? "● Live" : "Paused"}
                         </Badge>
                       </div>
                       <div className="bg-light p-2 rounded-3 text-center mb-3">
                          <span className="x-small text-muted fw-bold text-uppercase me-2 text-dark opacity-50">CODE:</span>
                          <span className="fw-bold text-success letter-spacing-1">{offer.code}</span>
                       </div>
                       <div className="d-flex gap-2">
                         <Button variant="light" className="border rounded-pill px-3 fw-bold flex-grow-1" onClick={() => toggleOffer(offer)}>
                           {offer.active ? "Pause" : "Activate"}
                         </Button>
                         <Button variant="light" className="border rounded-circle" onClick={() => deleteOffer(offer.id)}>
                           <FaTrash className="text-danger"/>
                         </Button>
                       </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
            {offers.length === 0 && <div className="p-5 text-center text-muted col-12 fw-bold">No active coupons found.</div>}
          </Row>
        </Tab>

        <Tab eventKey="banners" title={<span><FaImage className="me-2"/>App Banners</span>}>
          <Row className="g-4">
            {banners.map(banner => (
              <Col lg={6} key={banner.id}>
                <Card className="shadow-sm rounded-4 overflow-hidden border-0 h-100 bg-white">
                  <div className="position-relative">
                    <img src={banner.image} alt="" className="w-100" style={{ height: '180px', objectFit: 'cover' }} />
                    {!banner.active && <div className="banner-paused-overlay">PAUSED</div>}
                  </div>
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <h6 className="fw-bold mb-1 text-dark">{banner.title}</h6>
                        <div className="x-small text-muted fw-bold text-uppercase">SLA: High Engagement</div>
                      </div>
                      <Badge bg={banner.active ? "success" : "light"} className={banner.active ? "" : "text-muted border"}>
                         {banner.active ? "Broadcasting" : "Offline"}
                      </Badge>
                    </div>
                    <div className="d-flex gap-2 mt-4">
                        <Button variant="success" size="sm" className="rounded-pill px-4 fw-bold shadow-sm" onClick={() => toggleBanner(banner)}>
                           {banner.active ? "Pause Stream" : "Execute Stream"}
                        </Button>
                        <Button variant="light" className="border rounded-pill px-3 fw-bold" onClick={() => deleteBanner(banner.id)}>
                           <FaTrash className="text-danger me-1"/> Remove
                        </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
            {banners.length === 0 && <div className="p-5 text-center text-muted col-12 fw-bold">No app banners published.</div>}
          </Row>
        </Tab>
      </Tabs>

      {/* Coupon Modal */}
      <Modal show={showCouponModal} onHide={() => setShowCouponModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold text-success">Add/Edit Coupon</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 pt-1">
          <Form onSubmit={handleCouponSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Coupon Title</Form.Label>
              <Form.Control required className="bg-light border-0 py-2 shadow-none" placeholder="e.g. Flash Sale 50%" value={couponForm.title} onChange={e => setCouponForm({...couponForm, title: e.target.value})} />
            </Form.Group>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">Coupon Code</Form.Label>
                        <Form.Control required className="bg-light border-0 py-2 shadow-none" placeholder="FLASH50" value={couponForm.code} onChange={e => setCouponForm({...couponForm, code: e.target.value})} />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">Benefit (e.g. 50% or ₹100)</Form.Label>
                        <Form.Control required className="bg-light border-0 py-2 shadow-none" placeholder="50%" value={couponForm.discount} onChange={e => setCouponForm({...couponForm, discount: e.target.value})} />
                    </Form.Group>
                </Col>
            </Row>
            <Button variant="success" type="submit" className="w-100 rounded-pill fw-bold shadow-sm py-2 mt-2">Save Coupon</Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Banner Modal */}
      <Modal show={showBannerModal} onHide={() => setShowBannerModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold text-success">Add/Edit Banner</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 pt-1">
          <Form onSubmit={handleBannerSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Banner Title</Form.Label>
              <Form.Control required className="bg-light border-0 py-2 shadow-none" placeholder="Summer Electronics Fest" value={bannerForm.title} onChange={e => setBannerForm({...bannerForm, title: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="small fw-bold">Image URL</Form.Label>
              <Form.Control required className="bg-light border-0 py-2 shadow-none" placeholder="https://..." value={bannerForm.image} onChange={e => setBannerForm({...bannerForm, image: e.target.value})} />
            </Form.Group>
            <Button variant="success" type="submit" className="w-100 rounded-pill fw-bold shadow-sm py-2">Save Banner</Button>
          </Form>
        </Modal.Body>
      </Modal>

      <style>{`
        .custom-tabs .nav-link { color: #888; border: 0 !important; padding: 15px 25px; font-weight: 700; font-size: 0.9rem; transition: 0.3s; }
        .custom-tabs .nav-link.active { color: #16a34a !important; background: #16a34a10 !important; border-radius: 50px; }
        .letter-spacing-1 { letter-spacing: 1px; }
        .coupon-card { transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .coupon-card:hover { transform: translateY(-7px); box-shadow: 0 1rem 3rem rgba(0,0,0,0.1) !important; }
        .banner-paused-overlay { position: absolute; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); color: white; display: flex; align-items: center; justify-content: center; font-weight: 900; letter-spacing: 2px; }
        .x-small { font-size: 0.7rem; }
      `}</style>
    </div>
  );
};

export default OfferManagement;
