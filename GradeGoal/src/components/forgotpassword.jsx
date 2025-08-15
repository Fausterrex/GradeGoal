import React, { useRef, useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
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
        <>
            <Card>
                <Card.Body>
                    <h2 className='text-center mb-4'>Reset Password</h2>
                    {error && <Alert variant='danger'>{error}</Alert>}
                    {success && <Alert variant='success'>{success}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group id="email" className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type='email' ref={emailRef} required />
                        </Form.Group>
                        <Button disabled={loading} className='w-100 mt-3' type='submit'>
                            {loading ? 'Sending Reset Email...' : 'Send Reset Email'}
                        </Button>
                    </Form>
                    <div className='w-100 text-center mt-2'>
                        <Link to="/login">Back to Log In</Link>
                    </div>
                </Card.Body>
            </Card>
            <div className='w-100 text-center mt-2'>
                <p>Need an account? <Link to="/signup">Sign up</Link></p>
            </div>
        </>
    );
}

export default ForgotPassword
