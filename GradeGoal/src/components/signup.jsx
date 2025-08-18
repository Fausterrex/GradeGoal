import React, { useRef, useState } from 'react';
import { Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../utils/api';
import './index.css';
import './style.css';
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
        <>
            <Card id='main-card' className='min-h-screen flex items-center justify-center items-center bg-gray-100 overflow-hidden'>
                <Card.Header className='text-white p-4 rounded-t-xl border-0 shadow-sm bg-purple-700'>
                    <h2 id='header-signup' className='text-center mb-0 font-semibold text-xl'>Sign Up</h2>
                </Card.Header>
                <Card.Body className='p-6 px-5'>
                    {error && <Alert variant='danger'>{error}</Alert>}
                    {success && <Alert variant='success'>{success}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Row className='px-5'>
                            <Col>
                                <Form.Group id="first-name" className='mb-3 shadow' >
                                    <Form.Control 
                                    type='text'
                                    placeholder='First Name' />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group id="last-name" className='mb-3 shadow'>
                                    <Form.Control
                                    type='text' 
                                    placeholder='Last Name'
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group id="email" className="form-group mb-3 mx-5 shadow">
                            <Form.Control type='email' 
                            ref={emailRef} 
                            required 
                            placeholder='Email'/>
                        </Form.Group>
                        <Form.Group id="password" className="form-group mb-3 mx-5 shadow">
                            <Form.Control type='password' 
                            ref={passwordRef} 
                            required 
                            placeholder='Password'/>
                        </Form.Group>
                        <Form.Group id="password-confirm" className="form-group mb-3 mx-5 shadow">
                            <Form.Control type='password' 
                            ref={passwordConfirmRef} 
                            required 
                            placeholder='Confirm Password'/>
                        </Form.Group>
                        <div className='flex justify-center items-center w-full'>
                        <Button id='signup-button' disabled={loading} className='w-[300px] mt-3 shadow-lg' type='submit'>
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </Button>
                        </div>
                    </Form>
                    <hr></hr>
                    <div className='w-100 text-center mt-2'>
                        Already have an account? <Link to="/login" id='text-link'>Log In</Link>
                    </div>
                </Card.Body>
            </Card>
            
        </>
    );
}
