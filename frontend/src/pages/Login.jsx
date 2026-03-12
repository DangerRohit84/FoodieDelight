import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await login(email, password);
        if (res.success) {
            toast.success('Welcome back!');
            navigate('/');
        } else {
            toast.error(res.message);
        }
    };

    return (
        <div style={styles.container}>
            <motion.div
                style={styles.card}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <h2 style={styles.title}>Welcome Back</h2>
                <p style={styles.subtitle}>Login to your account</p>

                <form onSubmit={handleSubmit} style={styles.form}>
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
                    
                    <div style={{ textAlign: 'right', marginTop: '-0.5rem' }}>
                        <span style={styles.forgotLink} onClick={() => navigate('/forgot-password')}>Forgot Password?</span>
                    </div>

                    <motion.button
                        type="submit"
                        style={styles.button}
                        whileHover={{ scale: 1.02, backgroundColor: '#ff5252' }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Login
                    </motion.button>
                </form>
                <p style={styles.footerText}>
                    Don't have an account? <span style={styles.link} onClick={() => navigate('/register')}>Sign Up</span>
                </p>
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
    },
    forgotLink: {
        fontSize: '0.85rem',
        color: '#555',
        cursor: 'pointer',
        textDecoration: 'underline'
    }
};

export default Login;
