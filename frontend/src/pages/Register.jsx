import { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }
        
        setIsLoading(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/send-otp`, { email });
            toast.success('Verification code sent to your email!');
            setIsOtpSent(true);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const role = 'user'; // Always register as a standard user
        const res = await register(name, email, password, role, otp);
        setIsLoading(false);
        
        if (res.success) {
            toast.success('Account created! Welcome!');
            navigate('/');
        } else {
            toast.error(res.message);
        }
    };

    return (
        <div style={styles.container}>
            <motion.div
                style={styles.card}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h2 style={styles.title}>{isOtpSent ? 'Verify Email' : 'Create Account'}</h2>
                <p style={styles.subtitle}>
                    {isOtpSent ? `We sent a code to ${email}` : 'Join us for delicious food'}
                </p>

                {!isOtpSent ? (
                    <form onSubmit={handleSendOtp} style={styles.form}>
                        <div style={styles.inputGroup}>
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                style={styles.input}
                                required
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={styles.input}
                                required
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ ...styles.input, paddingRight: '40px' }}
                                required
                            />
                            <span onClick={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>

                        <motion.button
                            type="submit"
                            style={styles.button}
                            whileHover={{ scale: 1.02, backgroundColor: '#ff5252' }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Sending Code...' : 'Continue'}
                        </motion.button>
                    </form>
                ) : (
                    <form onSubmit={handleRegister} style={styles.form}>
                        <div style={styles.inputGroup}>
                            <input
                                type="text"
                                placeholder="6-digit OTP Code"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                style={{ ...styles.input, textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem', fontWeight: 'bold' }}
                                maxLength="6"
                                required
                            />
                        </div>
                        <motion.button
                            type="submit"
                            style={styles.button}
                            whileHover={{ scale: 1.02, backgroundColor: '#ff5252' }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Verifying...' : 'Complete Sign Up'}
                        </motion.button>
                        <p style={{...styles.footerText, marginTop: '1rem', cursor: 'pointer', color: '#ff6b6b'}} onClick={() => setIsOtpSent(false)}>
                            Cancel
                        </p>
                    </form>
                )}
                
                {!isOtpSent && (
                    <p style={styles.footerText}>
                        Already have an account? <span style={styles.link} onClick={() => navigate('/login')}>Login</span>
                    </p>
                )}
            </motion.div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
    },
    card: {
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        padding: '3rem',
        borderRadius: '20px',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center',
        border: '1px solid rgba(255, 255, 255, 0.18)',
    },
    title: {
        marginBottom: '0.5rem',
        color: '#333',
        fontWeight: '700',
    },
    subtitle: {
        color: '#666',
        marginBottom: '2rem',
        fontSize: '0.9rem',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.2rem',
    },
    inputGroup: {
        position: 'relative',
    },
    checkboxGroup: {
        marginTop: '0.5rem',
        marginBottom: '0.5rem',
    },
    input: {
        width: '100%',
        padding: '1rem',
        borderRadius: '10px',
        border: '1px solid #ddd',
        fontSize: '1rem',
        backgroundColor: '#f9f9f9',
        outline: 'none',
        transition: 'border-color 0.3s',
    },
    eyeIcon: {
        position: 'absolute',
        right: '15px',
        top: '50%',
        transform: 'translateY(-50%)',
        cursor: 'pointer',
        color: '#666',
        display: 'flex',
        alignItems: 'center'
    },
    button: {
        padding: '1rem',
        backgroundColor: '#ff6b6b',
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '1.1rem',
        fontWeight: '600',
        marginTop: '1rem',
        boxShadow: '0 4px 6px rgba(255, 107, 107, 0.2)',
    },
    footerText: {
        marginTop: '1.5rem',
        fontSize: '0.9rem',
        color: '#666',
    },
    link: {
        color: '#ff6b6b',
        fontWeight: 'bold',
        cursor: 'pointer',
    }
};

export default Register;
