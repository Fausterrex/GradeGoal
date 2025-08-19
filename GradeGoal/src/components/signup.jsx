import React, { useRef, useState } from 'react';
import { Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
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

    async function handleSubmit(e) {
        e.preventDefault();
        
        // Clear previous errors
        setError('');
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailRef.current.value)) {
            return setError('Please enter a valid email address.');
        }
        
        // Validate password length
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
            await registerUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || ''
            });
            setSuccess('Account created successfully! Welcome to GradeGoal!');
            // Clear the form
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
        <div className="h-[92.5vh] !flex !justify-center !items-center  ">
            <Card className="!w-full !max-w-2xl !border-0 !rounded-2xl !shadow-2xl !bg-white">
                <Card.Header className="!bg-[#3B389f] !text-white !p-6 !rounded-t-2xl !border-0 !shadow-lg">
                    <h2 className="!text-center !mb-0 !font-semibold !text-2xl">Sign Up</h2>
                </Card.Header>
                <Card.Body className="!p-8">
                    {error && <Alert variant='danger' className="!mb-6">{error}</Alert>}
                    {success && <Alert variant='success' className="!mb-6">{success}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <div className="!flex !gap-4 !mb-4">
                            <div className="!w-1/2">
                                <Form.Group className="!mb-3">
                                <Form.Control 
                                    type="text"
                                    placeholder="First Name"
                                    className="!w-full !px-4 !py-3 !border !border-gray-300 !rounded-3xl !shadow-lg !focus:border-[#3B389f] !focus:ring-2 !focus:ring-[#3B389f]/10 !focus:outline-none"
                                />
                                </Form.Group>
                            </div>
                            <div className="!w-1/2">
                                <Form.Group className="!mb-3">
                                <Form.Control 
                                    type="text"
                                    placeholder="Last Name"
                                    className="!w-full !px-4 !py-3 !border !border-gray-300 !rounded-3xl !shadow-lg !focus:border-[#3B389f] !focus:ring-2 !focus:ring-[#3B389f]/10 !focus:outline-none"
                                />
                                </Form.Group>
                            </div>
                        </div>
                        <Form.Group className="!mb-4">
                            <Form.Control 
                                type='email' 
                                ref={emailRef} 
                                required 
                                placeholder='Email'
                                className="!w-full !px-4 !py-3 !border !border-gray-300 !rounded-3xl !shadow-lg !focus:border-[#3B389f] !focus:ring-2 !focus:ring-[#3B389f]/10 !focus:outline-none"
                            />
                        </Form.Group>
                        <Form.Group className="!mb-4">
                            <Form.Control 
                                type='password' 
                                ref={passwordRef} 
                                required 
                                placeholder='Password'
                                className="!w-full !px-4 !py-3 !border !border-gray-300 !rounded-3xl !shadow-lg !focus:border-[#3B389f] !focus:ring-2 !focus:ring-[#3B389f]/10 !focus:outline-none"
                            />
                        </Form.Group>
                        <Form.Group className="!mb-6">
                            <Form.Control 
                                type='password' 
                                ref={passwordConfirmRef} 
                                required 
                                placeholder='Confirm Password'
                                className="!w-full !px-4 !py-3 !border !border-gray-300 !rounded-3xl !shadow-lg !focus:border-[#3B389f] !focus:ring-2 !focus:ring-[#3B389f]/10 !focus:outline-none"
                            />
                        </Form.Group>
                        <div className="!flex !justify-center !items-center !w-full">
                            <Button 
                                disabled={loading} 
                                className="!w-full !max-w-sm !bg-[#3B389f] !border-0 !rounded-full !py-3.5 !text-base !font-semibold !text-white !transition-all !duration-300 !hover:bg-[#5e5caa] !hover:-translate-y-0.5 !hover:shadow-lg !disabled:opacity-70 !disabled:transform-none !disabled:cursor-not-allowed !shadow-lg" 
                                type='submit'
                            >
                                {loading ? 'Creating Account...' : 'Sign Up'}
                            </Button>
                        </div>
                    </Form>
                    <hr className="!my-6 !border-gray-300"></hr>
                    <div className="!text-center !text-gray-600">
                        Already have an account? <Link to="/login" className="!text-[#3B389f] !hover:text-[#8f8f9e] !transition-colors !duration-200">Log In</Link>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
}
