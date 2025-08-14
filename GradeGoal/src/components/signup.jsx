import React, { useRef, useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
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
        <>
            <Card>
                <Card.Body>
                    <h2 className='text-center mb-4'>Sign Up</h2>
                    {error && <Alert variant='danger'>{error}</Alert>}
                    {success && <Alert variant='success'>{success}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group id="email" className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type='email' ref={emailRef} required />
                        </Form.Group>
                        <Form.Group id="password" className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type='password' ref={passwordRef} required />
                        </Form.Group>
                        <Form.Group id="password-confirm" className="mb-3">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control type='password' ref={passwordConfirmRef} required />
                        </Form.Group>
                        <Button disabled={loading} className='w-100 mt-3' type='submit'>
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
            <div className='w-100 text-center mt-2'>
                Already have an account? <a href="/login">Log In</a>
            </div>
        </>
    );
}
