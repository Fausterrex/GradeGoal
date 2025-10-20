import React, { useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { auth } from "../../backend/firebase";
const CustomEventModal = ({ isOpen, onClose, onEventAdded }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    eventTitle: '',
    eventDescription: '',
    eventDate: '',
    eventTime: '',
    reminderEnabled: true,
    reminderDays: 1
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const getAuthHeaders = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        return {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return {
      'Content-Type': 'application/json'
    };
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!currentUser?.userId) {
        throw new Error('User not authenticated');
      }

      // Combine date and time
      const eventDateTime = new Date(`${formData.eventDate}T${formData.eventTime}`);
      const eventEndDateTime = new Date(eventDateTime.getTime() + (60 * 60 * 1000)); // Add 1 hour for end time
      
      const eventData = {
        userId: currentUser.userId,
        eventTitle: formData.eventTitle,
        eventDescription: formData.eventDescription,
        eventStart: eventDateTime.toISOString(),
        eventEnd: eventEndDateTime.toISOString(),
        reminderEnabled: formData.reminderEnabled,
        reminderDays: formData.reminderDays,
        eventType: 'CUSTOM_EVENT',
        assessmentId: null,
        isNotified: false
      };

      console.log('Sending event data:', eventData);
      console.log('Event date time:', eventDateTime);
      console.log('Event end date time:', eventEndDateTime);

      const headers = await getAuthHeaders();
      const response = await axios.post('http://localhost:8080/api/custom-events', eventData, { headers });
      
      if (response.status === 201) {
        // Reset form
        setFormData({
          eventTitle: '',
          eventDescription: '',
          eventDate: '',
          eventTime: '',
          reminderEnabled: true,
          reminderDays: 1
        });
        
        // Notify parent component
        if (onEventAdded) {
          onEventAdded(response.data);
        }
        
        // Close modal
        onClose();
      }
    } catch (error) {
      console.error('Error creating custom event:', error);
      setError(error.response?.data?.message || 'Failed to create custom event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      {/* Backdrop with blur effect */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-md"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Add Custom Event</h2>
              <p className="text-sm text-gray-600">Create a personal reminder</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Title */}
          <div>
            <label htmlFor="eventTitle" className="block text-sm font-semibold text-gray-700 mb-2">
              Event Title *
            </label>
            <input
              type="text"
              id="eventTitle"
              name="eventTitle"
              value={formData.eventTitle}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter event title..."
            />
          </div>

          {/* Event Description */}
          <div>
            <label htmlFor="eventDescription" className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="eventDescription"
              name="eventDescription"
              value={formData.eventDescription}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
              placeholder="Enter event description..."
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="eventDate" className="block text-sm font-semibold text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                id="eventDate"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label htmlFor="eventTime" className="block text-sm font-semibold text-gray-700 mb-2">
                Time *
              </label>
              <input
                type="time"
                id="eventTime"
                name="eventTime"
                value={formData.eventTime}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Reminder Settings */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <input
                type="checkbox"
                id="reminderEnabled"
                name="reminderEnabled"
                checked={formData.reminderEnabled}
                onChange={handleInputChange}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="reminderEnabled" className="text-sm font-semibold text-gray-700">
                Enable Reminder
              </label>
            </div>
            
            {formData.reminderEnabled && (
              <div>
                <label htmlFor="reminderDays" className="block text-sm font-medium text-gray-600 mb-2">
                  Remind me
                </label>
                <select
                  id="reminderDays"
                  name="reminderDays"
                  value={formData.reminderDays}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value={1}>1 day before</option>
                  <option value={2}>2 days before</option>
                  <option value={3}>3 days before</option>
                  <option value={7}>1 week before</option>
                </select>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default CustomEventModal;
