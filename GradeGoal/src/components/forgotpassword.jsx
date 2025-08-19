import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';

function ForgotPassword() {
    const emailRef = useRef();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        
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
                <div className="border-0 rounded-2xl shadow-2xl bg-white">
                    <div className="p-8">
                        <h2 className="text-center mb-6 text-2xl font-bold text-gray-800">Reset Password</h2>
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
                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
                                <label className="font-semibold text-gray-700 mb-2 block">Email</label>
                                <input 
                                    type='email' 
                                    ref={emailRef} 
                                    required 
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:border-[#3B389f] focus:ring-2 focus:ring-[#3B389f]/10 focus:outline-none"
                                />
                            </div>
                            <button 
                                disabled={loading} 
                                className="w-full bg-[#3B389f] border-0 rounded-lg py-3 text-base font-semibold text-white transition-all duration-300 hover:bg-[#2d2a7a] hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70 disabled:transform-none" 
                                type='submit'
                            >
                                {loading ? 'Sending Reset Email...' : 'Send Reset Email'}
                            </button>
                        </form>
                        <div className="text-center mt-6">
                            <Link to="/login" className="text-[#3B389f] hover:text-[#2d2a7a] transition-colors duration-200">Back to Log In</Link>
                        </div>
                    </div>
                </div>
                <div className="text-center mt-6 text-gray-600">
                    <p>Need an account? <Link to="/signup" className="text-[#3B389f] hover:text-[#2d2a7a] transition-colors duration-200">Sign up</Link></p>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword
