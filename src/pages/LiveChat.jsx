import React, { useState, useRef, useEffect } from "react";
import { Card, Row, Col, Badge, Button, Form, InputGroup, ListGroup } from "react-bootstrap";
import { FaHeadset, FaPaperPlane, FaUser, FaRobot, FaCircle, FaSearch, FaEllipsisV, FaSmile } from "react-icons/fa";

const LiveChat = () => {
  const messagesEndRef = useRef(null);
  const [inputMsg, setInputMsg] = useState("");
  const [activeChat, setActiveChat] = useState(0);

  const [conversations, setConversations] = useState([
    {
      id: 1,
      customer: "Rahul Sharma",
      email: "rahul@email.com",
      avatar: "RS",
      status: "online",
      unread: 2,
      lastMsg: "Where is my order #4521?",
      time: "2 min ago",
      messages: [
        { sender: "customer", text: "Hi, I placed an order yesterday but haven't received any update.", time: "10:30 AM" },
        { sender: "customer", text: "Order #4521 - Can you check?", time: "10:31 AM" },
        { sender: "admin", text: "Hi Rahul! Let me check your order status right away.", time: "10:32 AM" },
        { sender: "admin", text: "Your order #4521 has been dispatched and is currently with the delivery partner. Expected delivery by 6 PM today.", time: "10:33 AM" },
        { sender: "customer", text: "Where is my order #4521?", time: "Just now" },
      ]
    },
    {
      id: 2,
      customer: "Priya Patel",
      email: "priya@email.com",
      avatar: "PP",
      status: "online",
      unread: 1,
      lastMsg: "I want to return a product",
      time: "5 min ago",
      messages: [
        { sender: "customer", text: "Hello, I received a damaged item.", time: "10:15 AM" },
        { sender: "admin", text: "Sorry to hear that, Priya. Could you share a photo of the damaged item?", time: "10:18 AM" },
        { sender: "customer", text: "I want to return a product", time: "10:20 AM" },
      ]
    },
    {
      id: 3,
      customer: "Amit Kumar",
      email: "amit@email.com",
      avatar: "AK",
      status: "offline",
      unread: 0,
      lastMsg: "Thanks for the help!",
      time: "1 hour ago",
      messages: [
        { sender: "customer", text: "Can you apply a coupon to my account?", time: "9:00 AM" },
        { sender: "admin", text: "Sure! I've applied WELCOME50 to your account. You'll see the discount on your next order.", time: "9:05 AM" },
        { sender: "customer", text: "Thanks for the help!", time: "9:06 AM" },
      ]
    },
    {
      id: 4,
      customer: "Sneha Reddy",
      email: "sneha@email.com",
      avatar: "SR", 
      status: "online",
      unread: 0,
      lastMsg: "Do you deliver to Hyderabad?",
      time: "15 min ago",
      messages: [
        { sender: "customer", text: "Do you deliver to Hyderabad?", time: "10:45 AM" },
      ]
    },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat, conversations]);

  const sendMessage = () => {
    if (!inputMsg.trim()) return;

    const updated = [...conversations];
    updated[activeChat].messages.push({
      sender: "admin",
      text: inputMsg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    updated[activeChat].lastMsg = inputMsg;
    updated[activeChat].time = "Just now";
    updated[activeChat].unread = 0;
    setConversations(updated);
    setInputMsg("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const chat = conversations[activeChat];

  return (
    <div className="container-fluid py-4 bg-white min-vh-100">
      <div className="mb-4 d-md-flex justify-content-between align-items-center bg-light p-3 rounded-4 border">
        <div>
          <h4 className="fw-bold text-success mb-1">💬 Live Chat Support</h4>
          <p className="text-muted small mb-0">Real-time customer conversations and support management.</p>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2 rounded-pill">
            <FaCircle size={6} className="me-1"/> {conversations.filter(c => c.status === "online").length} Online
          </Badge>
        </div>
      </div>

      <Card className="shadow-sm rounded-4 border-0 overflow-hidden" style={{height: 'calc(100vh - 220px)', minHeight: '500px'}}>
        <Row className="g-0 h-100">
          {/* Conversation List */}
          <Col md={4} className="border-end h-100 d-flex flex-column">
            <div className="p-3 border-bottom">
              <InputGroup size="sm" className="bg-light rounded-pill overflow-hidden">
                <InputGroup.Text className="bg-transparent border-0"><FaSearch className="text-muted" size={12}/></InputGroup.Text>
                <Form.Control placeholder="Search conversations..." className="border-0 bg-transparent shadow-none small" />
              </InputGroup>
            </div>
            <div className="flex-grow-1" style={{overflowY: 'auto'}}>
              <ListGroup variant="flush">
                {conversations.map((conv, idx) => (
                  <ListGroup.Item 
                    key={conv.id} 
                    action 
                    active={activeChat === idx}
                    onClick={() => { setActiveChat(idx); conv.unread = 0; setConversations([...conversations]); }}
                    className={`border-0 py-3 px-3 ${activeChat === idx ? 'bg-success bg-opacity-10 border-start border-4 border-success' : ''}`}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div className="position-relative">
                        <div className="avatar-circle bg-success bg-opacity-10 text-success fw-bold d-flex align-items-center justify-content-center rounded-circle" style={{width: 42, height: 42, fontSize: '0.8rem'}}>
                          {conv.avatar}
                        </div>
                        {conv.status === "online" && (
                          <div className="position-absolute bottom-0 end-0 bg-success rounded-circle border-2 border-white" style={{width: 10, height: 10}}></div>
                        )}
                      </div>
                      <div className="flex-grow-1 min-width-0">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-bold small text-truncate" style={{maxWidth: '140px'}}>{conv.customer}</span>
                          <span className="x-small text-muted">{conv.time}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="x-small text-muted text-truncate" style={{maxWidth: '160px'}}>{conv.lastMsg}</span>
                          {conv.unread > 0 && (
                            <Badge bg="danger" className="rounded-circle d-flex align-items-center justify-content-center" style={{width: 18, height: 18, fontSize: '0.6rem'}}>
                              {conv.unread}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          </Col>

          {/* Chat Window */}
          <Col md={8} className="h-100 d-flex flex-column">
            {/* Chat Header */}
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-white">
              <div className="d-flex align-items-center gap-3">
                <div className="avatar-circle bg-success bg-opacity-10 text-success fw-bold d-flex align-items-center justify-content-center rounded-circle" style={{width: 38, height: 38, fontSize: '0.75rem'}}>
                  {chat.avatar}
                </div>
                <div>
                  <div className="fw-bold small">{chat.customer}</div>
                  <div className="x-small text-muted d-flex align-items-center gap-1">
                    <FaCircle className={chat.status === "online" ? "text-success" : "text-secondary"} size={6}/>
                    {chat.status === "online" ? "Online now" : "Offline"} • {chat.email}
                  </div>
                </div>
              </div>
              <Button variant="light" className="rounded-circle border-0"><FaEllipsisV className="text-muted" size={14}/></Button>
            </div>

            {/* Messages */}
            <div className="flex-grow-1 p-4" style={{overflowY: 'auto', background: '#fafbfc'}}>
              <div className="text-center mb-4">
                <Badge bg="light" className="text-muted border rounded-pill px-3 py-1 x-small fw-bold shadow-sm">Today</Badge>
              </div>
              {chat.messages.map((msg, idx) => (
                <div key={idx} className={`d-flex mb-3 ${msg.sender === "admin" ? "justify-content-end" : "justify-content-start"}`}>
                  <div style={{maxWidth: '70%'}}>
                    <div className={`p-3 rounded-4 small ${
                      msg.sender === "admin" 
                        ? "bg-success text-white rounded-bottom-end-0" 
                        : "bg-white border shadow-sm rounded-bottom-start-0"
                    }`}>
                      {msg.text}
                    </div>
                    <div className={`x-small text-muted mt-1 d-flex align-items-center gap-1 ${msg.sender === "admin" ? "justify-content-end" : ""}`}>
                      {msg.sender === "admin" ? <FaRobot size={10}/> : <FaUser size={10}/>}
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-3 border-top bg-white">
              <div className="d-flex gap-2 align-items-end">
                <Button variant="light" className="rounded-circle border-0 flex-shrink-0"><FaSmile className="text-muted"/></Button>
                <Form.Control
                  as="textarea"
                  rows={1}
                  placeholder="Type your reply..."
                  className="border-0 bg-light rounded-pill px-3 py-2 shadow-none small"
                  style={{resize: 'none'}}
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  onKeyDown={handleKeyPress}
                />
                <Button variant="success" className="rounded-circle flex-shrink-0 shadow-sm d-flex align-items-center justify-content-center" style={{width: 40, height: 40}} onClick={sendMessage}>
                  <FaPaperPlane size={14}/>
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      <style>{`
        .x-small { font-size: 0.7rem; }
        .min-width-0 { min-width: 0; }
        .rounded-bottom-end-0 { border-bottom-right-radius: 0 !important; }
        .rounded-bottom-start-0 { border-bottom-left-radius: 0 !important; }
        .list-group-item.active { background-color: rgba(22,163,74,0.08) !important; color: inherit !important; border-color: #16a34a !important; }
      `}</style>
    </div>
  );
};

export default LiveChat;
