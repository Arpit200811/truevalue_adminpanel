import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { FaEdit, FaTrash, FaPlus, FaLaptop, FaTshirt, FaShoppingCart, FaMedkit, FaHamburger, FaAppleAlt, FaBaby, FaLayerGroup } from "react-icons/fa";
import CircleLoader from "react-spinners/CircleLoader";
import { DataService } from "../services/dataService";
import { Tabs, Tab, Modal, Button, Form, Row, Col, Badge, Card, Table } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const cats = await DataService.getCategories();
      if (Array.isArray(cats)) setCategories(cats);
      
      const subs = await DataService.getSubCategories();
      if (Array.isArray(subs)) setSubCategories(subs);
    };
    fetchData();
  }, []);

  const catSchema = Yup.object().shape({
    title: Yup.string().required("Category name is required"),
  });

  const subSchema = Yup.object().shape({
    title: Yup.string().required("Sub-category name is required"),
    parent_id: Yup.string().required("Parent category is required"),
  });

  const { register: regCat, handleSubmit: handleCatSubmit, reset: resetCat, formState: { errors: catErrors } } = useForm({
    resolver: yupResolver(catSchema),
  });

  const { register: regSub, handleSubmit: handleSubSubmit, reset: resetSub, formState: { errors: subErrors } } = useForm({
    resolver: yupResolver(subSchema),
  });

  const onCatSubmit = async (data) => {
    setLoading(true);
    try {
      const updatedCat = {
        id: selectedCat ? selectedCat.id : Date.now(),
        title: data.title,
        image: preview || "https://cdn-icons-png.flaticon.com/512/3081/3081840.png"
      };
      await DataService.saveCategory(updatedCat);
      setCategories(await DataService.getCategories());
      setLoading(false);
      setShowCatModal(false);
      Swal.fire("Success", "Category saved.", "success");
      resetCat();
    } catch (error) {
      setLoading(false);
      Swal.fire("Error", "Failed to save category", "error");
    }
  };

  const onSubSubmit = async (data) => {
    setLoading(true);
    try {
      const newSub = { 
        id: selectedSub ? selectedSub.id : Date.now(), 
        ...data 
      };
      await DataService.saveSubCategory(newSub);
      setSubCategories(await DataService.getSubCategories());
      setLoading(false);
      setShowSubModal(false);
      Swal.fire("Success", "Sub-category saved.", "success");
      resetSub();
    } catch (error) {
      setLoading(false);
      Swal.fire("Error", "Failed to save sub-category", "error");
    }
  };

  const deleteSub = (id) => {
    Swal.fire({ title: 'Remove Sub-Category?', text: 'This will affect product visibility.', icon: 'warning', showCancelButton: true }).then(async r => {
        if(r.isConfirmed) {
            await DataService.deleteSubCategory(id);
            setSubCategories(await DataService.getSubCategories());
            Swal.fire('Removed', 'Deleted', 'success');
        }
    });
  };

  const getIcon = (title) => {
     const t = title?.toLowerCase() || "";
     if(t.includes('food')) return <FaHamburger className="text-danger" size={30}/>;
     if(t.includes('pharma')) return <FaMedkit className="text-info" size={30}/>;
     if(t.includes('fashion')) return <FaTshirt className="text-primary" size={30}/>;
     if(t.includes('elec')) return <FaLaptop className="text-dark" size={30}/>;
     if(t.includes('veg')) return <FaAppleAlt className="text-success" size={30}/>;
     if(t.includes('baby')) return <FaBaby className="text-warning" size={30}/>;
     return <FaShoppingCart className="text-muted" size={30}/>;
  }

  return (
    <div className="container-fluid py-4 min-vh-100 bg-white">
      {loading && <div className="loader-overlay"><CircleLoader color="#16a34a" size={90} /></div>}

      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-3 bg-light p-3 rounded-4 border">
        <div>
          <h4 className="fw-bold text-success mb-0">📁 Category Management</h4>
          <p className="text-muted small mb-0">Manage categories and their sub-items.</p>
        </div>
        <div className="d-flex gap-2 mt-3 mt-md-0">
            <button className="btn btn-white border px-4 rounded-pill fw-bold shadow-sm" onClick={() => { resetSub(); setSelectedSub(null); setShowSubModal(true); }}>
              <FaLayerGroup className="me-2"/> Add Sub-Category
            </button>
            <button className="btn btn-success px-4 rounded-pill fw-bold shadow-sm" onClick={() => { resetCat(); setSelectedCat(null); setPreview(null); setShowCatModal(true); }}>
              <FaPlus className="me-2"/> Add Category
            </button>
        </div>
      </div>

      <Tabs defaultActiveKey="niches" className="custom-tabs border-0 mb-4">
        <Tab eventKey="niches" title="Main Categories">
            <Row className="g-4 mt-1">
                {categories.map((cat) => (
                    <Col lg={3} md={4} sm={6} key={cat.id}>
                        <Card className="shadow-sm rounded-4 text-center p-4 h-100 hover-lift bg-white border-0">
                            <div className="mb-3 p-3 bg-light rounded-circle mx-auto d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                                {cat.image && !cat.image.includes('flaticon') ? <img src={cat.image} alt="" className="img-fluid rounded" /> : getIcon(cat.title)}
                            </div>
                            <h6 className="fw-bold text-dark mb-1">{cat.title}</h6>
                            <Badge bg="success" className="bg-opacity-10 text-success x-small border mb-3">Category</Badge>
                            <div className="d-flex justify-content-center gap-2 pt-3 border-top">
                                <Button variant="link" className="text-success p-0" onClick={() => { setSelectedCat(cat); resetCat({ title: cat.title }); setPreview(cat.image); setShowCatModal(true); }}><FaEdit /></Button>
                                <Button variant="link" className="text-danger p-0" onClick={() => {
                                    Swal.fire({ title: 'Delete Category?', text: 'Cannot be undone.', icon: 'warning', showCancelButton: true }).then(async r => {
                                        if(r.isConfirmed) { 
                                          await DataService.deleteCategory(cat.id); 
                                          setCategories(await DataService.getCategories()); 
                                        }
                                    });
                                }}><FaTrash /></Button>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Tab>
        <Tab eventKey="sub" title="Sub-Categories">
             <Card className="shadow-sm rounded-4 overflow-hidden bg-white mt-3 border-0">
                <Table hover className="mb-0 align-middle">
                    <thead className="bg-light">
                        <tr className="small text-uppercase text-muted fw-bold">
                            <th className="ps-4">Sub-Category Name</th>
                            <th>Parent Category</th>
                            <th>Status</th>
                            <th className="text-end pe-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subCategories.map(s => (
                            <tr key={s.id}>
                                <td className="ps-4 fw-bold small">{s.title}</td>
                                <td><Badge bg="info" className="bg-opacity-10 text-info border x-small">{categories.find(c => String(c.id) === String(s.parent_id))?.title || 'Unknown'}</Badge></td>
                                <td><Badge bg="success" className="px-2">Active</Badge></td>
                                <td className="text-end pe-4">
                                    <Button variant="link" className="text-primary" onClick={() => { setSelectedSub(s); resetSub({ title: s.title, parent_id: s.parent_id }); setShowSubModal(true); }}><FaEdit/></Button>
                                    <Button variant="link" className="text-danger" onClick={() => deleteSub(s.id)}><FaTrash/></Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
             </Card>
        </Tab>
      </Tabs>

      {/* Cat Modal */}
      <Modal show={showCatModal} onHide={() => setShowCatModal(false)} centered>
          <Modal.Header closeButton className="border-0"><Modal.Title className="fw-bold text-success">Add/Edit Category</Modal.Title></Modal.Header>
          <Modal.Body className="p-4 pt-1">
              <form onSubmit={handleCatSubmit(onCatSubmit)}>
                  <div className="mb-3">
                      <Form.Label className="small fw-bold">Category Name</Form.Label>
                      <Form.Control className="bg-light border-0 py-2 shadow-none" {...regCat("title")} />
                  </div>
                  <div className="mb-3">
                      <Form.Label className="small fw-bold">Icon URL (Optional)</Form.Label>
                      <Form.Control className="bg-light border-0 py-2 shadow-none" onChange={e => setPreview(e.target.value)} />
                  </div>
                  <Button variant="success" type="submit" className="w-100 rounded-pill fw-bold shadow-sm mt-3">Save Category</Button>
              </form>
          </Modal.Body>
      </Modal>

      {/* Sub Modal */}
      <Modal show={showSubModal} onHide={() => setShowSubModal(false)} centered>
          <Modal.Header closeButton className="border-0"><Modal.Title className="fw-bold text-success">Add/Edit Sub-Category</Modal.Title></Modal.Header>
          <Modal.Body className="p-4 pt-1">
              <form onSubmit={handleSubSubmit(onSubSubmit)}>
                  <div className="mb-3">
                      <Form.Label className="small fw-bold">Sub-Category Name</Form.Label>
                      <Form.Control className="bg-light border-0 py-2 shadow-none" {...regSub("title")} />
                  </div>
                  <div className="mb-3">
                      <Form.Label className="small fw-bold">Parent Category</Form.Label>
                      <Form.Select className="bg-light border-0 py-2 shadow-none" {...regSub("parent_id")}>
                          <option value="">Select Parent...</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                      </Form.Select>
                  </div>
                  <Button variant="success" type="submit" className="w-100 rounded-pill fw-bold shadow-sm mt-3">Save Sub-Category</Button>
              </form>
          </Modal.Body>
      </Modal>

      <style>{`
        .loader-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.85); z-index: 9999; }
        .hover-lift:hover { transform: translateY(-7px); box-shadow: 0 1rem 3rem rgba(0,0,0,0.1) !important; }
        .custom-tabs .nav-link { color: #888; border: 0 !important; padding: 12px 25px; font-weight: 700; transition: 0.3s; }
        .custom-tabs .nav-link.active { color: #16a34a !important; background: #16a34a10 !important; border-radius: 50px; }
        .x-small { font-size: 0.7rem; }
      `}</style>
    </div>
  );
};

export default CategoryManagement;
