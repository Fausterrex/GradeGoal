import { useState, useEffect } from 'react';

const EditProfileModal = ({ isOpen, onClose, studentData, isAdmin = false, onSaveChanges }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    userId: '',
    joinDate: '',
    lastLogin: ''
  });

  useEffect(() => {
    if (studentData) {
      setFormData({
        firstName: studentData.name?.split(' ')[0] || '',
        lastName: studentData.name?.split(' ')[1] || '',
        email: studentData.email || '',
        userId: studentData.user_id || '',
        joinDate: studentData.joinDate || '2024-01-15',
        lastLogin: studentData.lastLogin || '2024-12-31'
      });
    } else if (isAdmin) {
      setFormData({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@gmail.com',
        userId: 'ADM001',
        joinDate: '2024-01-01',
        lastLogin: '2024-12-31'
      });
    }
  }, [studentData, isAdmin]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create updated data object
    const updatedData = {
      ...formData,
      name: `${formData.firstName} ${formData.lastName}`,
      user_id: formData.userId,
      email: formData.email,
      joinDate: formData.joinDate,
      lastLogin: formData.lastLogin
    };

    // Call the onSaveChanges prop to update the parent state
    if (onSaveChanges) {
      onSaveChanges(updatedData, isAdmin ? null : studentData?.user_id);
    }

    // Show success message
    alert('Profile changes saved successfully! Changes will be visible during this session.');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-center">
          <h2 className="text-2xl font-bold text-white">
            {isAdmin ? 'Edit Admin Profile' : 'Edit Student Profile'}
          </h2>
          <p className="text-blue-100 mt-1">
            {isAdmin ? 'Update administrator information' : 'Update student profile details'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Profile Header with Icon */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-lg font-semibold">
                {formData.firstName[0]}{formData.lastName[0]}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Profile Information</h3>
              <p className="text-sm text-gray-600">Update personal details</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
                placeholder="First Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
                placeholder="Last Name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
            <input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
              placeholder="User ID"
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">User ID cannot be changed</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Join Date</label>
              <input
                type="date"
                name="joinDate"
                value={formData.joinDate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Login</label>
              <input
                type="date"
                name="lastLogin"
                value={formData.lastLogin}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <span>💾</span>
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;