import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const ResetPassword = () => {
    const { token } = useParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/reset-password/${token}`, { password });
            
            // Automatically log them in by overriding token
            localStorage.setItem('userInfo', JSON.stringify(data));
            
            toast.success('Password successfully reset! You are now logged in.');
            // Force a reload to have context pick up the login if we didn't use context directly
            window.location.href = '/'; 
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password. Link may be expired.');
        } finally {
            setLoading(false);
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
                <h2 style={styles.title}>Reset Password</h2>
                <p style={styles.subtitle}>Enter your new password below.</p>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <input
                            type="password"
                            placeholder="New Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <input
                            type="password"
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                        {loading ? 'Saving...' : 'Reset Password'}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh',
    },
    card: {
        background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)',
        padding: '3rem', borderRadius: '20px', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        width: '100%', maxWidth: '400px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.18)',
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
        padding: '1rem', backgroundColor: '#2874f0', color: '#fff', border: 'none',
        borderRadius: '10px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: '600',
        marginTop: '1rem', boxShadow: '0 4px 6px rgba(40, 116, 240, 0.2)'
    }
};

export default ResetPassword;
