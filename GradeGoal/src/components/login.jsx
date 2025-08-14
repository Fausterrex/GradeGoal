import React, { useRef, useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { loginUser, registerUser } from '../utils/api';

function Login() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const { login } = useAuth();
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

        if (passwordRef.current.value.length < 6) {
            return setError('Password must be at least 6 characters long.');
        }

	        try {
            setError('');
            setSuccess('');
            setLoading(true);

	            const email = emailValue;
	            const password = passwordRef.current.value;
            const cred = await signInWithEmailAndPassword(auth, email, password);
            const firebaseUser = cred.user;
            try {
                await loginUser(firebaseUser.uid);
            } catch (backendErr) {
                await registerUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName || ''
                });
            }
            setSuccess('Logged in successfully!');
            setTimeout(() => {
                navigate('/maindashboard');
            }, 1500);
        } catch (error) {
                if (error.code === 'auth/invalid-credential') {
                    setError('Incorrect email or password. Please try again.');
            } else if (error.code === 'auth/invalid-email') {
                setError('Please enter a valid email address.');
            } else if (error.code === 'auth/weak-password') {
                setError('Password must be at least 6 characters long.');
            } else if (error.code === 'auth/too-many-requests') {
                setError('Too many failed login attempts. Please try again later.');
            } else {
                setError('Failed to log in: ' + (error.message || 'Unknown error'));
            }
        }
        setLoading(false);
    }

    return (
        <>
            <Card>
                <Card.Body>
                    <h2 className='text-center mb-4'>Log In</h2>
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
                        <Button disabled={loading} className='w-100 mt-3' type='submit'>
                            {loading ? 'Logging In...' : 'Log In'}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
            <div className='w-100 text-center mt-2'>
                Need an account? <a href="/signup">Sign up</a>
            </div>
        </>
    );
}

export default Login
