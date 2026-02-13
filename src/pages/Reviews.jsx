import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Row, Col, Form } from 'react-bootstrap';
import { FaStar, FaReply, FaCheckCircle, FaTrash, FaUserCircle, FaExclamationCircle } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { DataService } from "../services/dataService";

const Reviews = () => {
  const [activeType, setActiveType] = useState("All");
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      const data = await DataService.getReviews();
      if (Array.isArray(data)) {
        setReviews(data);
      }
    };
    fetchReviews();
  }, []);

  const handleApprove = async (id) => {
    await DataService.updateReview(id, "Approved");
    setReviews(await DataService.getReviews());
    Swal.fire({ icon: 'success', title: 'Review Approved', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Remove Review?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33'
    }).then(async res => {
      if(res.isConfirmed) {
        await DataService.deleteReview(id);
        setReviews(await DataService.getReviews());
        Swal.fire('Deleted', 'Review removed from store.', 'success');
      }
    });
  };

  const filteredReviews = reviews.filter(r => 
    activeType === "All" || 
    r.status === activeType || 
    (activeType === "Critical" && r.rating <= 2)
  );

  return (
    <div className="container-fluid py-4 min-vh-100 bg-white">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-3 bg-light p-3 rounded-4 border">
        <div>
          <h4 className="fw-bold text-success mb-1">⭐ Consumer Response Moderation</h4>
          <p className="text-muted small mb-0">Managing trust and quality across Food, Grocery & Marketplace units.</p>
        </div>
        <div className="d-flex gap-2 bg-white p-1 rounded-pill border">
           {["All", "Pending", "Critical"].map(t => (
              <Button 
                key={t}
                variant={activeType === t ? "success" : "white text-muted border-0"} 
                size="sm" 
                className={`rounded-pill px-3 fw-bold ${activeType === t ? 'shadow-sm' : ''}`}
                onClick={() => setActiveType(t)}
              >
                {t === "Critical" ? "🚨 Critical" : t}
              </Button>
           ))}
        </div>
      </div>

      <Row className="g-4">
         {filteredReviews.map(review => (
            <Col lg={6} key={review.id}>
               <Card className="border shadow-sm rounded-4 overflow-hidden h-100 bg-white">
                  <Card.Body className="p-4">
                     <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="d-flex gap-3 align-items-center">
                           <div className="rounded-circle bg-light p-2 d-flex align-items-center justify-content-center" style={{width: 50, height: 50}}>
                              <FaUserCircle size={30} className="text-success opacity-50"/>
                           </div>
                           <div>
                              <div className="fw-bold">{review.user}</div>
                              <div className="x-small text-muted">{review.date} on <span className="text-success fw-bold">{review.product}</span></div>
                           </div>
                        </div>
                        <div className="text-end">
                           <div className="d-flex text-warning gap-1 mb-1">
                              {[...Array(5)].map((_, i) => <FaStar key={i} className={i < review.rating ? "text-warning" : "text-light"} />)}
                           </div>
                           <Badge bg={review.status === "Approved" ? "success" : review.status === "Pending" ? "warning" : "danger"} className="bg-opacity-10 text-dark border x-small">
                              {review.status}
                           </Badge>
                        </div>
                     </div>
                     <p className="text-dark small mb-4 italic" style={{ lineHeight: '1.6' }}>"{review.comment}"</p>
                     
                     <div className="d-flex justify-content-between align-items-center border-top pt-3">
                        <div className="d-flex gap-2">
                           {review.status !== "Approved" && (
                              <Button variant="success" size="sm" className="rounded-pill px-3 fw-bold shadow-sm" onClick={() => handleApprove(review.id)}>
                                 <FaCheckCircle className="me-1"/> Approve
                              </Button>
                           )}
                           <Button variant="light border" size="sm" className="rounded-pill px-3 fw-bold" onClick={() => Swal.fire({title: 'Reply to User', text: `Replying to ${review.user}`, input: 'textarea', confirmButtonColor: '#16a34a', confirmButtonText: 'Send Dispatch'})}>
                              <FaReply className="me-1"/> Public Reply
                           </Button>
                        </div>
                        <Button variant="light" size="sm" className="rounded-circle border" onClick={() => handleDelete(review.id)}>
                           <FaTrash className="text-danger"/>
                        </Button>
                     </div>
                  </Card.Body>
                  {review.rating <= 2 && (
                     <div className="bg-danger bg-opacity-10 p-2 text-center x-small text-danger fw-bold d-flex align-items-center justify-content-center gap-2">
                        <FaExclamationCircle/> HIGH PRIORITY: AI detected negative sentiment. Immediate resolution required.
                     </div>
                  )}
               </Card>
            </Col>
         ))}
         {filteredReviews.length === 0 && (
            <div className="col-12 text-center py-5">
               <div className="bg-light d-inline-block p-4 rounded-circle mb-3"><FaCheckCircle size={40} className="text-success opacity-50"/></div>
               <h5 className="text-muted fw-bold">No active moderation required in this queue.</h5>
            </div>
         )}
      </Row>

      <style>{`
        .x-small { font-size: 0.75rem; }
        .italic { font-style: italic; color: #444; }
      `}</style>
    </div>
  );
};

export default Reviews;
