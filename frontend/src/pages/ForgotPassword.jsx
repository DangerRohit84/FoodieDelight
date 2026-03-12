import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, { email });
            toast.success(data.message || 'Email sent successfully. Check your inbox.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <motion.div
                style={styles.card}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h2 style={styles.title}>Forgot Password</h2>
                <p style={styles.subtitle}>Enter your email to receive a password reset link. <br/><span style={{color: '#ff6b6b', fontWeight: 'bold'}}>Note: The link will expire in exactly 10 minutes.</span></p>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>

                    <motion.button
                        type="submit"
                        style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
                        whileHover={!loading ? { scale: 1.02, backgroundColor: '#ff5252' } : {}}
                        whileTap={!loading ? { scale: 0.98 } : {}}
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </motion.button>
                </form>
                <p style={styles.footerText}>
                    Remembered? <span style={styles.link} onClick={() => navigate('/login')}>Back to Login</span>
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
        maxWidth: '430px',
        textAlign: 'center',
        border: '1px solid rgba(255, 255, 255, 0.18)',
    },
    title: { fontWeight: '700', marginBottom: '0.5rem', color: '#333' },
    subtitle: { color: '#666', marginBottom: '2rem', fontSize: '0.9rem' },
    form: { display: 'flex', flexDirection: 'column', gap: '1.2rem' },
    inputGroup: { position: 'relative' },
    input: {
        width: '100%', padding: '1rem', borderRadius: '10px',
        border: '1px solid #ddd', fontSize: '1rem', backgroundColor: '#f9f9f9',
        outline: 'none', transition: 'border-color 0.3s'
    },
    button: {
        padding: '1rem', backgroundColor: '#ff6b6b', color: '#fff', border: 'none',
        borderRadius: '10px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: '600',
        marginTop: '0.5rem', boxShadow: '0 4px 6px rgba(255, 107, 107, 0.2)'
    },
    footerText: { marginTop: '1.5rem', fontSize: '0.9rem', color: '#666' },
    link: { color: '#ff6b6b', fontWeight: 'bold', cursor: 'pointer' }
};

export default ForgotPassword;
