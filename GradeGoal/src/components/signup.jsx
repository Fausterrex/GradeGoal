import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../utils/api';

export default function Signup() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const passwordConfirmRef = useRef();
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [emailError, setEmailError] = useState(''); 

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) {
            setEmailError('');
            return false;
        }
        if (!emailRegex.test(email)) {
            setEmailError('Please enter a valid email address.');
            return false;
        }
        setEmailError('');
        return true;
    };

    const handleEmailChange = (e) => {
        validateEmail(e.target.value);
    };

    const handleEmailBlur = (e) => {
        validateEmail(e.target.value);
    };

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setEmailError('');
        
        if (!firstName.trim()) {
            return setError('Please enter your first name.');
        }
        
        if (!lastName.trim()) {
            return setError('Please enter your last name.');
        }
        
        if (!validateEmail(emailRef.current.value)) {
            return;
        }
        
        if (passwordRef.current.value.length < 6) {
            return setError('Password must be at least 6 characters long.');
        }
        
        if (passwordRef.current.value !== passwordConfirmRef.current.value) {
            return setError('Passwords do not match');
        }

        try {
            setError('');
            setSuccess('');
            setLoading(true);
            
            const cred = await signup(emailRef.current.value, passwordRef.current.value);
            const firebaseUser = cred.user;
            const displayName = `${firstName.trim()} ${lastName.trim()}`;
            
            await registerUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: displayName
            });
            setSuccess('Account created successfully! Welcome to GradeGoal!');
            setFirstName('');
            setLastName('');
            emailRef.current.value = '';
            passwordRef.current.value = '';
            passwordConfirmRef.current.value = '';
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                setError('An account with this email already exists.');
            } else if (error.code === 'auth/weak-password') {
                setError('Password should be at least 6 characters long.');
            } else if (error.code === 'auth/invalid-email') {
                setError('Please enter a valid email address.');
            } else {
                setError('Failed to create an account: ' + (error.message || 'Unknown error'));
            }
        }
        setLoading(false);
    }

    return (
        <div className="h-[92.5vh] flex justify-center items-center">
            <div className="w-full max-w-2xl border-0 rounded-2xl shadow-2xl bg-white">
                <div className="bg-[#3B389f] text-white p-6 rounded-t-2xl border-0 shadow-lg">
                    <h2 className="text-center mb-0 font-semibold text-2xl">Sign Up</h2>
                </div>
                <div className="p-8">
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
                        <div className="flex gap-4 mb-4">
                            <div className="w-1/2">
                                <div className="mb-3">
                                <input 
                                    type="text"
                                    placeholder="First Name"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-3xl shadow-lg focus:border-[#3B389f] focus:ring-2 focus:ring-[#3B389f]/10 focus:outline-none"
                                />
                                </div>
                            </div>
                            <div className="w-1/2">
                                <div className="mb-3">
                                <input 
                                    type="text"
                                    placeholder="Last Name"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-3xl shadow-lg focus:border-[#3B389f] focus:ring-2 focus:ring-[#3B389f]/10 focus:outline-none"
                                />
                                </div>
                            </div>
                        </div>
                        <div className="mb-4">
                            <input 
                                type='email' 
                                ref={emailRef} 
                                required 
                                placeholder='Email'
                                className={`w-full px-4 py-3 border rounded-3xl shadow-lg focus:ring-2 focus:ring-[#3B389f]/10 focus:outline-none ${
                                    emailError 
                                        ? 'border-red-500 focus:border-red-500' 
                                        : 'border-gray-300 focus:border-[#3B389f]'
                                }`}
                                onChange={handleEmailChange}
                                onBlur={handleEmailBlur}
                            />
                            {emailError && (
                                <p className="text-red-500 text-sm mt-1">{emailError}</p>
                            )}
                        </div>
                        <div className="mb-4">
                            <input 
                                type='password' 
                                ref={passwordRef} 
                                required 
                                placeholder='Password'
                                className="w-full px-4 py-3 border border-gray-300 rounded-3xl shadow-lg focus:border-[#3B389f] focus:ring-2 focus:ring-[#3B389f]/10 focus:outline-none"
                            />
                        </div>
                        <div className="mb-6">
                            <input 
                                type='password' 
                                ref={passwordConfirmRef} 
                                required 
                                placeholder='Confirm Password'
                                className="w-full px-4 py-3 border border-gray-300 rounded-3xl shadow-lg focus:border-[#3B389f] focus:ring-2 focus:ring-[#3B389f]/10 focus:outline-none"
                            />
                        </div>
                        <div className="flex justify-center items-center w-full">
                            <button 
                                disabled={loading} 
                                className="w-full max-w-sm bg-[#3B389f] border-0 rounded-full py-3.5 text-base font-semibold text-white transition-all duration-300 hover:bg-[#5e5caa] hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70 disabled:transform-none disabled:cursor-not-allowed shadow-lg" 
                                type='submit'
                            >
                                {loading ? 'Creating Account...' : 'Sign Up'}
                            </button>
                        </div>
                    </form>
                    <hr className="my-6 border-gray-300"></hr>
                    <div className="text-center text-gray-600">
                        Already have an account? <Link to="/login" className="text-[#3B389f] hover:text-[#8f8f9e] transition-colors duration-200">Log In</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
