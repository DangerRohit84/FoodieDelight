import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const PartnerWithUs = () => {
    const [formData, setFormData] = useState({
        restaurantName: '',
        ownerName: '',
        email: '',
        phone: ''
    });
    const [document, setDocument] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setDocument(e.target.files[0]);
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();

        if (formData.phone.replace(/\D/g, '').length !== 10) {
            toast.error('Please enter a valid 10-digit phone number');
            return;
        }

        if (!document) {
            toast.error('Please upload a valid document (PDF)');
            return;
        }

        // Validate file size strictly (Max 5MB)
        if (document.size > 5 * 1024 * 1024) {
            toast.error('File size strictly exceeds 5MB. Please upload a smaller PDF.');
            return;
        }

        setIsSubmitting(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/send-otp`, { email: formData.email });
            toast.success('Verification code sent to your email!');
            setIsOtpSent(true);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFinalSubmit = async (e) => {
        e.preventDefault();

        if (!otp) {
            toast.error('Please enter the OTP');
            return;
        }

        setIsSubmitting(true);
        const data = new FormData();
        data.append('restaurantName', formData.restaurantName);
        data.append('ownerName', formData.ownerName);
        data.append('email', formData.email);
        data.append('phone', formData.phone);
        data.append('document', document);
        data.append('otp', otp);

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/applications`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success('Application submitted successfully! Our team will contact you soon.');
            setFormData({ restaurantName: '', ownerName: '', email: '', phone: '' });
            setDocument(null);
            setOtp('');
            setIsOtpSent(false);
            e.target.reset();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit application. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={styles.pageWrapper}>
            <motion.div
                style={styles.container}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div style={styles.header}>
                    <h1 style={styles.title}>Partner With Us</h1>
                    <p style={styles.subtitle}>Join our platform to grow your restaurant's reach and manage your own orders directly.</p>
                </div>

                {!isOtpSent ? (
                    <form onSubmit={handleSendOtp} style={styles.form}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Restaurant Name</label>
                            <input
                                type="text"
                                name="restaurantName"
                                value={formData.restaurantName}
                                onChange={handleInputChange}
                                style={styles.input}
                                placeholder="Enter your restaurant's name"
                                required
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Owner's Full Name</label>
                            <input
                                type="text"
                                name="ownerName"
                                value={formData.ownerName}
                                onChange={handleInputChange}
                                style={styles.input}
                                placeholder="Enter owner's full name"
                                required
                            />
                        </div>

                        <div style={styles.row}>
                            <div style={{ ...styles.inputGroup, flex: 1 }}>
                                <label style={styles.label}>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                    placeholder="restaurant@example.com"
                                    required
                                />
                            </div>
                            <div style={{ ...styles.inputGroup, flex: 1 }}>
                                <label style={styles.label}>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                    placeholder="10-digit mobile number"
                                    required
                                />
                            </div>
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>
                                Upload Documents (Must be a single PDF)
                            </label>
                            <p style={{fontSize: '0.85rem', color: '#ff6b6b', margin: '0 0 10px 0', fontWeight: '500'}}>
                                *Please combine your Menu, Government Certified Certificate (FSSAI), and your Restaurant's Full Address into ONE single PDF file.
                            </p>
                            <div style={styles.fileUploadBox}>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    accept=".pdf"
                                    style={styles.fileInput}
                                    required
                                />
                            </div>
                            <p style={styles.helpText}>Max file size: 5MB. Supported format: Only PDF.</p>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            style={styles.submitBtn}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Sending Code...' : 'Continue'}
                        </motion.button>
                    </form>
                ) : (
                    <form onSubmit={handleFinalSubmit} style={styles.form}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Enter 6-digit Verification Code</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                style={{ ...styles.input, textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem', fontWeight: 'bold' }}
                                maxLength="6"
                                placeholder="123456"
                                required
                            />
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            style={styles.submitBtn}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting Application...' : 'Complete Application'}
                        </motion.button>
                        <p style={{...styles.helpText, textAlign: 'center', marginTop: '1rem', cursor: 'pointer', color: '#ff6b6b'}} onClick={() => setIsOtpSent(false)}>
                            Cancel
                        </p>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

const styles = {
    pageWrapper: {
        minHeight: '80vh',
        padding: '3rem 5%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8f9fa'
    },
    container: {
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        padding: '3rem',
        borderRadius: '20px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
        maxWidth: '700px',
        width: '100%'
    },
    header: {
        textAlign: 'center',
        marginBottom: '2.5rem'
    },
    title: {
        fontSize: '2.5rem',
        color: '#2d3436',
        marginBottom: '0.5rem',
        fontWeight: 'bold'
    },
    subtitle: {
        color: '#636e72',
        fontSize: '1.1rem',
        lineHeight: '1.5'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
    },
    row: {
        display: 'flex',
        gap: '1.5rem',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    },
    label: {
        fontWeight: '600',
        color: '#2d3436',
        fontSize: '0.95rem'
    },
    input: {
        padding: '1rem',
        borderRadius: '10px',
        border: '1px solid #dfe6e9',
        fontSize: '1rem',
        transition: 'all 0.3s ease',
        outline: 'none',
        backgroundColor: '#fff'
    },
    fileUploadBox: {
        border: '2px dashed #b2bec3',
        padding: '1.5rem',
        borderRadius: '10px',
        textAlign: 'center',
        backgroundColor: '#fafafa',
        transition: 'border-color 0.3s'
    },
    fileInput: {
        width: '100%',
        cursor: 'pointer'
    },
    helpText: {
        fontSize: '0.85rem',
        color: '#b2bec3',
        marginTop: '0.3rem'
    },
    submitBtn: {
        padding: '1rem 2rem',
        backgroundColor: '#ff6b6b',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '1rem',
        transition: 'background-color 0.3s',
        boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)'
    }
};

export default PartnerWithUs;
