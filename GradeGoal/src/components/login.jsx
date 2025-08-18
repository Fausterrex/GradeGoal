import React, { useRef, useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { loginUser, registerUser } from '../utils/api';
import './style.css';
import './index.css';
import googleLogo from '../drawables/google.png';

function Login() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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

            await loginUser(firebaseUser.uid);
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
        <div id='main-card' className='min-h-screen flex items-center justify-center items-center bg-gray-100 overflow-hidden'>
            <Card className="login-card">
                <Card.Header className="login-header">
                    <h2 className="login-title">Log In</h2>
                </Card.Header>
                <Card.Body className="login-body">
                    {error && <Alert variant='danger'>{error}</Alert>}
                    {success && <Alert variant='success'>{success}</Alert>}
                    
                    <Form onSubmit={handleSubmit} className="login-form">
                        <Form.Group className="form-group">
                            <div className="input-wrapper">
                                <Form.Control 
                                    type='email' 
                                    ref={emailRef} 
                                    required 
                                    placeholder='Email'
                                    className="form-input"
                                />
                            </div>
                        </Form.Group>
                        
                        <Form.Group className="form-group">
                            <div className="input-wrapper">
                                <Form.Control 
                                    type={showPassword ? 'text' : 'password'}
                                    ref={passwordRef} 
                                    required 
                                    placeholder='Password'
                                    className="form-input"
                                />
                                <button 
                                    type="button" 
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                        </Form.Group>
                        
                        <div className="forgot-password flex align-center justify-center">
                            <Link to="/forgot-password" className="forgot-link align-center">
                                Forgot password?
                            </Link>
                        </div>
                        
                        <Button disabled={loading} className='login-btn w-[300px]' type='submit'>
                            {loading ? 'Logging In...' : 'Log In'}
                        </Button>
                    </Form>
                    
                    <div className="divider">
                        <span className="divider-text">or</span>
                    </div>
                    
                    <Button className="google-btn shadow" variant="outline-secondary">
                        <img src={googleLogo} alt="Google" className="google-icon" />

                    </Button>
                    
                    <div className="signup-prompt">
                        <p>Don't have an account? <Link to="/signup" className="signup-link">Sign Up</Link></p>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
}

export default Login;
