import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../firebase';
import { loginUser, registerUser, googleSignIn, facebookSignIn } from '../utils/api';

function Login() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const { updateCurrentUserWithData } = useAuth();
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
            const userDataFromDB = await loginUser(firebaseUser.uid);
            const userData = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: userDataFromDB?.displayName || firebaseUser.email
            };

            updateCurrentUserWithData(userData);
            setSuccess('Logged in successfully!');
            setTimeout(() => {
                navigate('/maindashboard');
            }, 1500);
        } catch (error) {
            if (error.code === 'auth/invalid-credential') {
                setError('Incorrect email or password. Please try again.');
            } else if (error.code === 'auth/user-not-found') {
                setError('Incorrect email or password. Please try again.');
            } else if (error.code === 'auth/wrong-password') {
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
            updateCurrentUserWithData(userData);
            
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

    const handleFacebookLogin = async () => {
        try {
            setError('');
            setSuccess('');
            setLoading(true);

            const result = await signInWithPopup(auth, facebookProvider);
            const firebaseUser = result.user;
    
            const userData = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || firebaseUser.email
            };

            await facebookSignIn(userData);
            updateCurrentUserWithData(userData);

            setSuccess('Logged in with Facebook successfully!');
            setTimeout(() => {
                navigate('/maindashboard');
            }, 1500);
        } catch (error) {
            console.error('Facebook login failed:', error);
            setError('Failed to log in with Facebook: ' + error.message);
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <div className="h-full flex justify-center items-center min-h-screen">
            <div className="w-[50vh] max-w-5xl border-0 rounded-2xl shadow-2xl bg-white">
                <div className="bg-[#3B389f] border-0 rounded-t-2xl p-6 text-center">
                    <h2 className="text-white text-2xl font-bold m-0">Log In</h2>
                </div>
                <div className="p-8 flex flex-col items-center">
                    {error && (
                        <div className="w-full mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="w-full mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                            {success}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="w-full flex flex-col items-center mb-6">
                        <div className="mb-4 w-full max-w-sm">
                            <div className="relative flex items-center">
                                <input 
                                    type='email' 
                                    ref={emailRef} 
                                    required 
                                    placeholder='Email'
                                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-base transition-all duration-200 focus:border-[#3B389f] focus:ring-2 focus:ring-[#3B389f]/10 focus:outline-none"
                                />
                            </div>
                        </div>
                        
                        <div className="mb-4 w-full max-w-sm">
                            <div className="relative flex items-center">
                                <input 
                                    type={showPassword ? 'text' : 'password'}
                                    ref={passwordRef} 
                                    required 
                                    placeholder='Password'
                                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-base transition-all duration-200 focus:border-[#3B389f] focus:ring-2 focus:ring-[#3B389f]/10 focus:outline-none"
                                />
                                <button 
                                    type="button" 
                                    className="absolute right-3 text-gray-500 text-lg cursor-pointer z-10"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                        </div>
                        
                        <div className="text-center mb-6 w-full">
                            <Link to="/forgot-password" className="text-gray-500 text-sm font-medium transition-colors duration-200 hover:text-[#2d2a7a] hover:underline">
                                Forgot password?
                            </Link>
                        </div>
                        
                        <button 
                            disabled={loading} 
                            className="w-full max-w-sm bg-[#3B389f] border-0 rounded-full py-3.5 text-base font-semibold text-white transition-all duration-300 mb-6 hover:bg-[#2d2a7a] hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70 disabled:transform-none flex justify-center items-center"
                            type='submit'
                        >
                            {loading ? 'Logging In...' : 'Log In'}
                        </button>
                        
                        <div className="relative text-center mb-3 w-full">
                            <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300"></div>
                            <span className="bg-white px-4 text-gray-500 text-sm relative z-10">or</span>
                        </div>

                        <div className="flex items-center justify-center mt-3">
                            <button 
                                type="button"
                                className="bg-white text-gray-700 w-12 h-12 rounded-full shadow-md border border-gray-300 hover:bg-gray-100 flex items-center justify-center transition-all duration-200 cursor-pointer" 
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
                                className="bg-white text-gray-700 w-12 h-12 rounded-full shadow-md border border-gray-300 hover:bg-gray-100 flex items-center justify-center mx-3 transition-all duration-200 cursor-pointer"
                                onClick={handleFacebookLogin}
                                disabled={loading}
                            >
                                <img 
                                src="https://www.svgrepo.com/show/452196/facebook-1.svg" 
                                alt="Facebook" 
                                className="w-5 h-5"
                                />
                            </button>
                        </div>
                    </form>
                    
                    <div className="text-center text-gray-500 text-sm">
                        <p>Don't have an account? <Link to="/signup" className="text-[#3B389f] underline font-semibold transition-colors duration-200 hover:text-[#2d2a7a]">Sign Up</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
