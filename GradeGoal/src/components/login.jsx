import React, { useRef, useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { loginUser, registerUser, googleSignIn } from '../utils/api';

function Login() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const { login, loginWithUid, refreshCurrentUser } = useAuth();
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

    const handleGoogleLogin = async () => {
        try {
            setError('');
            setSuccess('');
            setLoading(true);

            const result = await signInWithPopup(auth, googleProvider);
            const firebaseUser = result.user;

            const userData = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || firebaseUser.email
            };

            await googleSignIn(userData);
            await loginWithUid(firebaseUser.uid);
            await refreshCurrentUser();
            
            setSuccess('Logged in with Google successfully!');
            setTimeout(() => {
                navigate('/maindashboard');
            }, 1500);
        } catch (error) {
            console.error('Google login failed:', error);
            setError('Failed to log in with Google: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

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
                            <div className='w-100 text-center mt-2'>
                                <Link to="/forgot-password">Forgot Password</Link>
                            </div>
                        <Button disabled={loading} className='w-100 mt-3' type='submit'>
                            {loading ? 'Logging In...' : 'Log In'}
                        </Button>
                        <div className="flex items-center justify-center mt-3">
                            <button 
                                type="button"
                                className="bg-white text-gray-700 w-12 h-12 !rounded-full shadow-md border border-gray-300 hover:bg-gray-100 flex items-center justify-center" 
                                onClick={handleGoogleLogin}
                                disabled={loading}
                            >
                                <img 
                                    src="https://www.svgrepo.com/show/355037/google.svg" 
                                    alt="Google" 
                                    className="w-6 h-6"
                                />
                            </button>

                            <button 
                                className="bg-white text-gray-700 w-12 h-12 !rounded-full shadow-md border border-gray-300 hover:bg-gray-100 flex items-center justify-center mx-3"
                                onClick={() => setError('Facebook login not implemented yet')}
                            >
                                <img 
                                src="https://www.svgrepo.com/show/452196/facebook-1.svg" 
                                alt="Facebook" 
                                className="w-5 h-5"
                                />
                            </button>
                        </div>

                    </Form>
                </Card.Body>
            </Card>
            <div className='w-100 text-center mt-2'>
                <p>Need an account? <Link to="/signup">Sign up</Link></p>
            </div>
        </>
    );
}

export default Login
