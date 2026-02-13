import React, { useState, useEffect, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { 
  FaEdit, FaTrash, FaPlus, FaCubes, FaBarcode, 
  FaCalendarAlt, FaTag, FaLeaf, FaFlask, FaUtensils, FaClock, FaSearch
} from "react-icons/fa";
import CircleLoader from "react-spinners/CircleLoader";
import { Modal, Tabs, Tab, Button, Form, Table, Badge, Row, Col, Card } from "react-bootstrap";
import { DataService } from "../services/dataService";
import "bootstrap/dist/css/bootstrap.min.css";

const schema = Yup.object().shape({
  name: Yup.string().required("Product name is required"),
  type: Yup.string().required("Product type is required"), // Food, Grocery, Pharma, Fashion, General
  mrp: Yup.number().typeError("MRP must be a number").required("MRP required").min(0),
  price: Yup.number().typeError("Sale Price must be a number").required("Sale Price required").min(0),
  quantity: Yup.number().typeError("Qty must be a number").required("Qty required").min(0),
  category_id: Yup.string().required("Category is required"),
  brand_id: Yup.string().required("Brand is required"),
  unit: Yup.string().optional().nullable(),
  is_veg: Yup.boolean().optional(),
  rx_required: Yup.boolean().optional(),
  expiry_date: Yup.string().optional().nullable().transform((value) => value || null),
  preparation_time: Yup.string().optional().nullable().transform((value) => value || null),
  sku: Yup.string().required("SKU is required"),
  description: Yup.string().optional().nullable(),
  variants: Yup.array().of(
    Yup.object().shape({
      type: Yup.string().required("Type"),
      value: Yup.string().required("Value"),
      extraPrice: Yup.number().default(0),
      stock: Yup.number().default(0)
    })
  ).optional()
});

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 12, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const result = await DataService.getProducts({
      page,
      limit: 12,
      search: searchQuery || undefined
    });
    setProducts(result.data);
    setMeta(result.meta);
    setLoading(false);
  }, [page, searchQuery]);

  useEffect(() => {
    fetchProducts();
    const fetchMeta = async () => {
      const cats = await DataService.getCategories();
      if (Array.isArray(cats)) setCategories(cats);
      const brnds = await DataService.getBrands();
      if (Array.isArray(brnds)) setBrands(brnds);
    };
    fetchMeta();
  }, [fetchProducts]);

  const { register, control, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { variants: [], is_veg: true, rx_required: false }
  });

  const productType = watch("type");

  const { fields, append, remove } = useFieldArray({ control, name: "variants" });

  const onSubmit = async (data) => {
    console.log("Form submitted with data:", data);
    setLoading(true);
    try {
      let imageUrl = preview;
      if (selectedFile) {
        const uploadRes = await DataService.uploadImage(selectedFile);
        imageUrl = uploadRes.url;
      }

      const updatedProduct = {
        ...data,
        id: selectedProduct ? selectedProduct.id : Date.now(),
        image: imageUrl || "https://via.placeholder.com/150",
        status: data.quantity > 0 ? "Active" : "Out of Stock",
        createdAt: selectedProduct ? selectedProduct.createdAt : new Date().toISOString()
      };

      console.log("Saving product:", updatedProduct);
      await DataService.saveProduct(updatedProduct);
      await fetchProducts();
      
      setLoading(false);
      setShowModal(false);
      Swal.fire("Global Catalog Updated", "Product is now live on Super-App.", "success");
    } catch (error) {
      console.error("Error saving product:", error);
      setLoading(false);
      Swal.fire("Error", error.response?.data?.message || "Failed to save product", "error");
    }
  };

  const onError = (errors) => {
    console.log("Form validation errors:", errors);
    const errorFields = Object.keys(errors).map(key => {
      return `${key}: ${errors[key].message}`;
    }).join('\n');
    
    Swal.fire({
      title: "Please fill required fields",
      html: `<div style="text-align: left; font-size: 14px;">${errorFields.split('\n').join('<br>')}</div>`,
      icon: "warning"
    });
  };

  const handleEdit = (p) => {
    setSelectedProduct(p);
    // Convert product data to match form structure
    const formData = {
      ...p,
      category_id: String(p.category_id || p.category?.id || ''),
      brand_id: String(p.brand_id || ''),
      quantity: p.quantity || p.stock || 0,
      variants: p.variants || []
    };
    reset(formData);
    setPreview(p.image);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Remove from Global Catalog?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33"
    }).then(async (result) => {
      if (result.isConfirmed) {
        await DataService.deleteProduct(id);
        await fetchProducts();
        Swal.fire("Deleted!", "Removed from store.", "success");
      }
    });
  };

  const downloadCSV = () => {
    const headers = ["ID", "Name", "Type", "MRP", "Price", "Stock", "Status", "Brand"];
    const rows = products.map(p => [
      p.id,
      p.name,
      p.type,
      p.mrp,
      p.price,
      p.quantity,
      p.status,
      brands.find(b => String(b.id) === String(p.brand_id))?.name || "N/A"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `products_catalog_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container-fluid py-4 min-vh-100 bg-white">
      {loading && <div className="loader-overlay"><CircleLoader color="#16a34a" size={90} /></div>}

      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-3 bg-light p-3 rounded-4 border">
        <div>
          <h4 className="fw-bold text-success mb-0">🛍️ Product Management</h4>
          <p className="text-muted small mb-0">Manage all your products, inventory and pricing.</p>
        </div>
        <div className="d-flex gap-2">
            <div className="input-group bg-white rounded-pill px-3 shadow-sm border overflow-hidden" style={{maxWidth: '300px'}}>
              <span className="input-group-text bg-transparent border-0"><FaSearch className="text-muted small"/></span>
              <Form.Control 
                placeholder="Search products..." 
                className="border-0 shadow-none small"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              />
            </div>
            <Button variant="outline-dark" className="rounded-pill px-3 fw-bold shadow-sm" onClick={downloadCSV}>Export Catalog</Button>
            <Button variant="success" className="rounded-pill px-4 shadow-sm fw-bold" onClick={() => { setSelectedProduct(null); reset({variants: [], is_veg: true, rx_required: false, type: 'General'}); setPreview(null); setShowModal(true); }}>
            <FaPlus className="me-2"/> Add New Product
            </Button>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="bg-success bg-opacity-10 p-3 rounded-4 mb-3 border border-success border-opacity-25 d-flex justify-content-between align-items-center animate__animated animate__fadeIn">
          <div className="fw-bold text-success small">
            ⚡ {selectedIds.length} items selected for batch processing
          </div>
          <div className="d-flex gap-2">
            <Button variant="danger" size="sm" className="rounded-pill px-3 fw-bold" onClick={handleBulkDelete}>Delete All</Button>
            <Button variant="success" size="sm" className="rounded-pill px-3 fw-bold" onClick={() => handleBulkStatus(100)}>Mark In Stock</Button>
            <Button variant="outline-secondary" size="sm" className="rounded-pill px-3 fw-bold" onClick={() => setSelectedIds([])}>Clear</Button>
          </div>
        </div>
      )}

      <Card className="shadow-sm rounded-4 border-0 mt-4 overflow-hidden">
        <div className="table-responsive">
          <Table hover className="mb-0 align-middle">
            <thead className="bg-light">
              <tr className="small text-uppercase text-muted">
                <th className="ps-4" style={{width: '40px'}}>
                  <Form.Check 
                    type="checkbox"
                    checked={selectedIds.length === products.length && products.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedIds(products.map(p => p.id));
                      else setSelectedIds([]);
                    }}
                  />
                </th>
                <th>Product / Type</th>
                <th>Category / Brand</th>
                <th>Pricing</th>
                <th>Stock & Unit</th>
                <th>Attributes</th>
                <th>Status</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td className="ps-4">
                    <Form.Check 
                      type="checkbox"
                      checked={selectedIds.includes(p.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedIds([...selectedIds, p.id]);
                        else setSelectedIds(selectedIds.filter(id => id !== p.id));
                      }}
                    />
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-3">
                      <div className="position-relative">
                        <img src={p.image} alt="" className="rounded shadow-sm" style={{width: 50, height: 50, objectFit: 'cover'}} />
                        {p.type === 'Food' && (
                           <div className={`position-absolute bottom-0 end-0 border-white border text-center`} style={{ width: 14, height: 14, background: 'white', borderRadius: '2px', padding: '1px' }}>
                              <div className={`rounded-circle ${p.is_veg ? 'bg-success' : 'bg-danger'}`} style={{ width: '100%', height: '100%' }}></div>
                           </div>
                        )}
                      </div>
                      <div>
                        <div className="fw-bold small">{p.name}</div>
                        <Badge bg="light" className="text-dark border x-small">{p.type}</Badge>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="small fw-bold">{categories.find(c => String(c.id) === String(p.category_id))?.title}</div>
                    <div className="x-small text-muted">{brands.find(b => String(b.id) === String(p.brand_id))?.name}</div>
                  </td>
                  <td className="small">
                     <div className="text-muted text-decoration-line-through x-small">₹{p.mrp}</div>
                     <div className="fw-bold text-success">₹{p.price}</div>
                  </td>
                  <td>
                    <div className="small fw-bold">{p.quantity} <span className="text-muted fw-normal">{p.unit || 'Units'}</span></div>
                  </td>
                  <td>
                     <div className="d-flex flex-wrap gap-1">
                        {p.rx_required && <Badge bg="danger" className="x-small"><FaFlask className="me-1"/> Rx</Badge>}
                        {p.preparation_time && <Badge bg="info" className="x-small text-white"><FaClock className="me-1"/> {p.preparation_time}</Badge>}
                        {p.expiry_date && <Badge bg="warning" className="x-small text-dark"><FaCalendarAlt className="me-1"/> Exp: {p.expiry_date}</Badge>}
                        {p.variants?.length > 0 && <Badge bg="success" className="bg-opacity-10 text-success x-small"><FaCubes className="me-1"/> {p.variants.length} Var</Badge>}
                     </div>
                  </td>
                  <td><Badge bg={p.status === "Active" ? "success" : "danger"} className="x-small">{p.status}</Badge></td>
                  <td className="text-center">
                     <div className="d-flex justify-content-center gap-2">
                        <Button variant="light border" size="sm" onClick={() => handleEdit(p)}><FaEdit className="text-primary"/></Button>
                        <Button variant="light border" size="sm" onClick={() => handleDelete(p.id)}><FaTrash className="text-danger"/></Button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="d-flex justify-content-between align-items-center p-4 border-top">
             <div className="small text-muted">
                Showing {products.length} of {meta.total} products
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

      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered backdrop="static">
        <Modal.Header closeButton className="border-0 px-4">
          <Modal.Title className="fw-bold text-success">Super-App Catalog Entry</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 pt-1">
          <Form onSubmit={handleSubmit(onSubmit, onError)}>
            <Tabs defaultActiveKey="type" className="mb-4 custom-tabs-advanced border-0">
              <Tab eventKey="type" title="Product Classification">
                 <Row className="g-3 mt-1">
                    <Col md={12}>
                       <Form.Label className="small fw-bold text-muted text-uppercase">What are you selling?</Form.Label>
                       <div className="d-flex flex-wrap gap-2">
                          {['Food', 'Grocery', 'Pharma', 'Fashion', 'General'].map(t => (
                             <Form.Check
                                key={t}
                                type="radio"
                                label={t}
                                value={t}
                                {...register("type")}
                                className={`btn-check`}
                                id={`type-${t}`}
                             />
                          ))}
                          <div className="d-flex gap-2">
                             {['Food', 'Grocery', 'Pharma', 'Fashion', 'General'].map(t => (
                                <label key={t} htmlFor={`type-${t}`} className={`btn btn-sm ${productType === t ? 'btn-success' : 'btn-outline-success'} rounded-pill px-4`}>
                                   {t}
                                </label>
                             ))}
                          </div>
                       </div>
                    </Col>
                    <Col md={8}>
                       <Form.Group>
                          <Form.Label className="small fw-bold text-muted">Full Display Name</Form.Label>
                          <Form.Control {...register("name")} className="bg-light border-0 py-2 shadow-none" placeholder="e.g. Organic Brown Egg 6pcs / Samsung TV / Dettol Liquid" />
                          <small className="text-danger">{errors.name?.message}</small>
                       </Form.Group>
                    </Col>
                    <Col md={4}>
                       <Form.Label className="small fw-bold text-muted">Core Brand</Form.Label>
                       <Form.Select {...register("brand_id")} className="bg-light border-0 py-2 shadow-none">
                          <option value="">Select Brand...</option>
                          {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                       </Form.Select>
                    </Col>
                 </Row>
              </Tab>

              <Tab eventKey="attributes" title="Dynamic Attributes">
                 <Row className="g-3 mt-1">
                    {/* Conditionally show fields based on Type */}
                    {(productType === 'Food' || productType === 'Grocery') && (
                       <Col md={4} className="border-end pe-4">
                          <Form.Label className="small fw-bold text-success"><FaLeaf className="me-1"/> Dietary Preferences</Form.Label>
                          <Form.Check type="switch" label="Is Vegetarian?" {...register("is_veg")} defaultChecked />
                          <Form.Text className="text-muted x-small">Shows green/red dot in customer app.</Form.Text>
                       </Col>
                    )}

                    {productType === 'Pharma' && (
                       <Col md={4} className="border-end pe-4">
                          <Form.Label className="small fw-bold text-danger"><FaFlask className="me-1"/> Compliance</Form.Label>
                          <Form.Check type="switch" label="Prescription Required (Rx)?" {...register("rx_required")} />
                          <div className="mt-2">
                             <Form.Label className="x-small fw-bold">Expiry Date</Form.Label>
                             <Form.Control type="date" size="sm" {...register("expiry_date")} className="bg-light border-0" />
                          </div>
                       </Col>
                    )}

                    {productType === 'Food' && (
                       <Col md={4} className="border-end pe-4">
                          <Form.Label className="small fw-bold text-info"><FaUtensils className="me-1"/> Restaurant Logic</Form.Label>
                          <Form.Control size="sm" {...register("preparation_time")} placeholder="e.g. 15-20 min" className="bg-light border-0" />
                          <Form.Text className="text-muted x-small">Displayed as prep time on Zomato style app.</Form.Text>
                       </Col>
                    )}

                    <Col md={productType === 'General' || productType === 'Fashion' ? 12 : 8}>
                       <Row className="g-3">
                          <Col md={4}>
                             <Form.Label className="x-small fw-bold text-muted">Category Hierarchy</Form.Label>
                             <Form.Select size="sm" {...register("category_id")} className="bg-light border-0">
                                <option value="">Select...</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                             </Form.Select>
                          </Col>
                          <Col md={4}>
                             <Form.Label className="x-small fw-bold text-muted">UoM (Unit of Measure)</Form.Label>
                             <Form.Control size="sm" {...register("unit")} placeholder="e.g. kg, ml, pack, pc" className="bg-light border-0" />
                          </Col>
                          <Col md={4}>
                             <Form.Label className="x-small fw-bold text-muted">Global SKU</Form.Label>
                             <Form.Control size="sm" {...register("sku")} className="bg-light border-0" />
                          </Col>
                       </Row>
                    </Col>
                 </Row>
              </Tab>
              
              <Tab eventKey="pricing" title="Inventory & Pricing">
                 <Row className="g-3 mt-1">
                    <Col md={4}>
                       <Form.Label className="small fw-bold text-muted">MRP (Maximum Retail Price)</Form.Label>
                       <Form.Control type="number" {...register("mrp")} className="bg-light border-0 py-2 shadow-none" placeholder="0.00" />
                    </Col>
                    <Col md={4}>
                       <Form.Label className="small fw-bold text-muted">Offer Price (Selling Price)</Form.Label>
                       <Form.Control type="number" {...register("price")} className="bg-success bg-opacity-10 border-success border-opacity-25 py-2 shadow-none fw-bold" placeholder="0.00" />
                    </Col>
                    <Col md={4}>
                       <Form.Label className="small fw-bold text-muted">Current Inventory Stock</Form.Label>
                       <Form.Control type="number" {...register("quantity")} className="bg-light border-0 py-2 shadow-none" placeholder="0" />
                    </Col>
                 </Row>
              </Tab>

              <Tab eventKey="variants" title={<span>Global Variants <Badge bg="success" className="ms-1 px-2">{fields.length}</Badge></span>}>
                 <div className="bg-light p-3 rounded-4 border mt-1">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                       <span className="small fw-bold text-muted text-uppercase">Variant Configuration (Size/Color/Volume)</span>
                       <Button size="sm" variant="success" className="rounded-pill px-3" onClick={() => append({type: "", value: "", extraPrice: 0, stock: 0})}>+ Add New</Button>
                    </div>
                    <Table borderless size="sm">
                       <thead>
                          <tr className="x-small text-muted text-uppercase">
                             <th>Attribute Type</th>
                             <th>Attribute Value</th>
                             <th>Price Markup</th>
                             <th>Variant Stock</th>
                             <th className="text-end">Action</th>
                          </tr>
                       </thead>
                       <tbody>
                          {fields.map((field, index) => (
                            <tr key={field.id} className="border-bottom border-white">
                              <td><Form.Control size="sm" {...register(`variants.${index}.type`)} placeholder="e.g. Size" className="border-0 shadow-sm" /></td>
                              <td><Form.Control size="sm" {...register(`variants.${index}.value`)} placeholder="e.g. 500ml" className="border-0 shadow-sm" /></td>
                              <td><Form.Control size="sm" type="number" {...register(`variants.${index}.extraPrice`)} className="border-0 shadow-sm" /></td>
                              <td><Form.Control size="sm" type="number" {...register(`variants.${index}.stock`)} className="border-0 shadow-sm" /></td>
                              <td className="text-end"><Button variant="link" className="text-danger p-0" onClick={() => remove(index)}><FaTrash/></Button></td>
                            </tr>
                          ))}
                       </tbody>
                    </Table>
                 </div>
              </Tab>

              <Tab eventKey="media" title="Rich Media">
                 <Form.Group className="mb-3 mt-1">
                    <Form.Label className="small fw-bold text-muted">Upload High-Res Asset Image</Form.Label>
                    <Form.Control type="file" className="bg-light border-0" onChange={(e) => {
                       if(e.target.files?.[0]) {
                         setSelectedFile(e.target.files[0]);
                         setPreview(URL.createObjectURL(e.target.files[0]));
                       }
                    }} />
                    {preview && <div className="mt-3 text-center p-4 bg-light rounded-4 border border-dashed"><img src={preview} alt="preview" style={{ maxHeight: 180 }} /></div>}
                 </Form.Group>
                 <Form.Group>
                    <Form.Label className="small fw-bold text-muted">Bullet Points / Description</Form.Label>
                    <Form.Control as="textarea" rows={3} {...register("description")} className="bg-light border-0 shadow-none" placeholder="Write features or nutritional info here..." />
                 </Form.Group>
              </Tab>
            </Tabs>

            <div className="d-flex justify-content-end gap-3 border-top pt-4 mt-3">
              <Button variant="light" className="px-5 border" onClick={() => setShowModal(false)}>Discard</Button>
              <Button variant="success" type="submit" className="rounded-pill px-5 shadow-sm fw-bold">Push to Super-App Registry</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <style>{`
        .loader-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.8); z-index: 9999;
        }
        .x-small { font-size: 0.7rem; }
        .custom-tabs-advanced .nav-link { 
          border: 0; color: #888; font-size: 0.9rem; font-weight: 600; padding: 12px 25px;
          border-bottom: 3px solid transparent; transition: 0.3s;
        }
        .custom-tabs-advanced .nav-link.active {
          color: #16a34a !important; background: transparent !important; border-bottom-color: #16a34a;
        }
        input:focus, select:focus, textarea:focus { box-shadow: none !important; }
      `}</style>
    </div>
  );
};

export default ProductManagement;
