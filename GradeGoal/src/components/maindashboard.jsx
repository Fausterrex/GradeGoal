import React from 'react'
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';

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
    <div className="!min-h-screen !flex !items-center !justify-center !p-8 !bg-gradient-to-br !from-purple-100 !to-purple-200">
      <div className="!w-full !max-w-md">
        <div className="!bg-white !rounded-2xl !shadow-2xl !p-8">
          <h2 className="!text-center !mb-6 !text-2xl !font-bold !text-gray-800">Welcome to GradeGoal!</h2>
          {currentUser && (
            <div className="!text-center !mb-6">
              <p className="!text-gray-600">Logged in as: <strong className="!text-[#3B389f]">{currentUser.email}</strong></p>
            </div>
          )}
          <div className="!text-center">
            <p className="!text-gray-600 !mb-6">Your dashboard is ready. More features coming soon!</p>
            <Button 
              variant="outline-danger" 
              onClick={handleLogout} 
              className="!w-full !bg-red-600 !border-red-600 !text-white !hover:bg-red-700 !hover:border-red-700 !transition-colors !duration-200"
            >
              Log Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainDashboard
