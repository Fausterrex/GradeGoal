import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../backend/firebase';

/**
 * ForgotPassword Component
 * 
 * Handles password reset functionality for users who have forgotten their password.
 * Sends password reset email via Firebase Authentication and provides user feedback.
 * Redirects to login page after successful email sending.
 */
function ForgotPassword() {
    // Form references and state
    const emailRef = useRef();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    /**
     * Handle form submission for password reset
     * Validates email format, sends reset email via Firebase, and handles errors
     * @param {Event} e - Form submission event
     */
    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const emailValue = (emailRef.current.value || '').trim();
        if (!emailRegex.test(emailValue)) {
            return setError('Please enter a valid email address.');
        }

        try {
            setError('');
            setSuccess('');
            setLoading(true);

            const email = emailValue;
            await sendPasswordResetEmail(auth, email);
            
            setSuccess('Password reset email sent! Check your inbox.');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                setError('No account found with this email address.');
            } else if (error.code === 'auth/invalid-email') {
                setError('Please enter a valid email address.');
            } else if (error.code === 'auth/too-many-requests') {
                setError('Too many requests. Please try again later.');
            } else {
                setError('Failed to send reset email: ' + (error.message || 'Unknown error'));
            }
        }
        setLoading(false);
    }

    return (
        <div className="min-h-screen flex justify-center items-center p-8 bg-gradient-to-br bg-white">
            <div className="w-full max-w-md">
                {/* Main Form Container */}
                <div className="border-0 rounded-2xl shadow-2xl bg-white">
                    <div className="p-8">
                        {/* Header */}
                        <h2 className="text-center mb-6 text-2xl font-bold text-gray-800">Reset Password</h2>
                        
                        {/* Error and Success Messages */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                                {success}
                            </div>
                        )}
                        
                        {/* Password Reset Form */}
                        <form onSubmit={handleSubmit}>
                            {/* Email Input */}
                            <div className="mb-6">
                                <label className="font-semibold text-gray-700 mb-2 block">Email</label>
                                <input 
                                    type='email' 
                                    ref={emailRef} 
                                    required 
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:border-[#3B389f] focus:ring-2 focus:ring-[#3B389f]/10 focus:outline-none"
                                />
                            </div>
                            
                            {/* Submit Button */}
                            <button 
                                disabled={loading} 
                                className="w-full bg-[#3B389f] border-0 rounded-lg py-3 text-base font-semibold text-white transition-all duration-300 hover:bg-[#2d2a7a] hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70 disabled:transform-none" 
                                type='submit'
                            >
                                {loading ? 'Sending Reset Email...' : 'Send Reset Email'}
                            </button>
                        </form>
                        
                        {/* Back to Login Link */}
                        <div className="text-center mt-6">
                            <Link to="/login" className="text-[#3B389f] hover:text-[#2d2a7a] transition-colors duration-200">Back to Log In</Link>
                        </div>
                    </div>
                </div>
                
                {/* Sign Up Link */}
                <div className="text-center mt-6 text-gray-600">
                    <p>Need an account? <Link to="/signup" className="text-[#3B389f] hover:text-[#2d2a7a] transition-colors duration-200">Sign up</Link></p>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
