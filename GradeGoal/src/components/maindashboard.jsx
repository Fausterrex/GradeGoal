import React from 'react'
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Card } from 'react-bootstrap';

function MainDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  }

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
      <div className="w-100" style={{ maxWidth: "400px" }}>
        <Card>
          <Card.Body>
            <h2 className="text-center mb-4">Welcome to GradeGoal!</h2>
            {currentUser && (
              <div className="text-center mb-3">
                <p>Logged in as: <strong>{currentUser.email}</strong></p>
              </div>
            )}
            <div className="text-center">
              <p>Your dashboard is ready. More features coming soon!</p>
              <Button variant="outline-danger" onClick={handleLogout} className="w-100">
                Log Out
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  )
}

export default MainDashboard
