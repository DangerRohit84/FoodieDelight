import { motion, AnimatePresence } from 'framer-motion';
import { FaLock, FaTimes, FaShieldAlt, FaCreditCard, FaUniversity, FaMoneyBillWave } from 'react-icons/fa';
import { useState } from 'react';

const PaymentModal = ({ isOpen, onClose, onPaymentSuccess, totalAmount }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedOption, setSelectedOption] = useState('card');
    const [processMessage, setProcessMessage] = useState('Securing connection...');

    const handleMockPayment = (success = true) => {
        setIsProcessing(true);
        const messages = [
            'Securing connection...',
            'Verifying details...',
            `Authorizing ₹${totalAmount?.toFixed(2)}...`,
            'Finalizing transaction...'
        ];
        
        let msgIndex = 0;
        const msgInterval = setInterval(() => {
            msgIndex++;
            if (msgIndex < messages.length) {
                setProcessMessage(messages[msgIndex]);
            } else {
                clearInterval(msgInterval);
            }
        }, 800);

        // Simulate network delay
        setTimeout(() => {
            clearInterval(msgInterval);
            setIsProcessing(false);
            if (success) {
                onPaymentSuccess({
                    id: 'MOCK_PYMT_' + Math.random().toString(36).substring(7),
                    status: 'captured',
                    update_time: new Date().toISOString(),
                    email_address: 'demo_user@example.com',
                    method: selectedOption,
                    isCOD: selectedOption === 'cod'
                });
            } else {
                alert('Payment Failed');
            }
        }, 3500); // Slightly longer for better animation experience
    };

    if (!isOpen) return null;

    const ProcessingOverlay = () => (
        <motion.div 
            style={styles.processingOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div style={styles.loaderContainer}>
                <motion.div 
                    style={styles.pulseRing}
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div 
                    style={styles.mainLoader}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
                <motion.div 
                    style={styles.lockIcon}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                >
                    <FaLock size={20} color="#3392fd" />
                </motion.div>
            </div>
            <AnimatePresence mode="wait">
                <motion.p 
                    key={processMessage}
                    style={styles.processingText}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                >
                    {processMessage}
                </motion.p>
            </AnimatePresence>
            <p style={styles.processingSubText}>Please do not refresh or close this window</p>
        </motion.div>
    );

    return (
        <AnimatePresence>
            <div style={styles.overlay}>
                <motion.div 
                    style={styles.modal}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                >
                    {isProcessing && <ProcessingOverlay />}

                    <div style={{ ...styles.modalContent, filter: isProcessing ? 'blur(4px)' : 'none', pointerEvents: isProcessing ? 'none' : 'auto' }}>
                        <div style={styles.header}>
                            <div style={styles.headerLeft}>
                                <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" style={styles.logo} />
                                <div style={styles.divider}></div>
                                <span style={styles.amount}>₹{totalAmount?.toFixed(2)}</span>
                            </div>
                            <button onClick={onClose} style={styles.closeBtn}><FaTimes /></button>
                        </div>

                        <div style={styles.body}>
                            <div style={styles.secureHeader}>
                                <FaShieldAlt color="#4caf50" />
                                <span style={styles.secureText}>100% Secure Payments</span>
                                <FaLock color="#999" size={12} style={{marginLeft: 'auto'}} />
                            </div>

                            <h4 style={styles.sectionTitle}>Cards, UPI & More</h4>

                            <div style={styles.paymentOptions}>
                                <div 
                                    style={{
                                        ...styles.option,
                                        borderColor: selectedOption === 'card' ? '#3392fd' : '#eee',
                                        background: selectedOption === 'card' ? '#f0f7ff' : 'white'
                                    }}
                                    onClick={() => setSelectedOption('card')}
                                >
                                    <div style={styles.iconBox}><FaCreditCard color="#1a73e8" /></div>
                                    <div style={{flex: 1}}>
                                        <span style={{fontWeight: selectedOption === 'card' ? '600' : '400'}}>Card</span>
                                        <p style={{...styles.optionSmall, marginLeft: 0}}>Visa, Master, RuPay, Maestro</p>
                                    </div>
                                    {selectedOption === 'card' && <div style={styles.checkedCircle}></div>}
                                </div>
                                <div 
                                    style={{
                                        ...styles.option,
                                        borderColor: selectedOption === 'upi' ? '#3392fd' : '#eee',
                                        background: selectedOption === 'upi' ? '#f0f7ff' : 'white'
                                    }}
                                    onClick={() => setSelectedOption('upi')}
                                >
                                    <div style={styles.iconBox}><img src="https://i.pinimg.com/736x/6c/08/05/6c0805b924906d8d11aa31165baefeca.jpg" width="30" alt="UPI" /></div>
                                    <div style={{flex: 1}}>
                                        <span style={{fontWeight: selectedOption === 'upi' ? '600' : '400'}}>UPI / QR</span>
                                        <p style={{...styles.optionSmall, marginLeft: 0}}>Google Pay, PhonePe, Paytm</p>
                                    </div>
                                    {selectedOption === 'upi' && <div style={styles.checkedCircle}></div>}
                                </div>
                                <div 
                                    style={{
                                        ...styles.option,
                                        borderColor: selectedOption === 'netbanking' ? '#3392fd' : '#eee',
                                        background: selectedOption === 'netbanking' ? '#f0f7ff' : 'white'
                                    }}
                                    onClick={() => setSelectedOption('netbanking')}
                                >
                                    <div style={styles.iconBox}><FaUniversity color="#7b1fa2" /></div>
                                    <div style={{flex: 1}}>
                                        <span style={{fontWeight: selectedOption === 'netbanking' ? '600' : '400'}}>Netbanking</span>
                                        <p style={{...styles.optionSmall, marginLeft: 0}}>All Indian Banks</p>
                                    </div>
                                    {selectedOption === 'netbanking' && <div style={styles.checkedCircle}></div>}
                                </div>
                                <div 
                                    style={{
                                        ...styles.option,
                                        borderColor: selectedOption === 'cod' ? '#3392fd' : '#eee',
                                        background: selectedOption === 'cod' ? '#f0f7ff' : 'white'
                                    }}
                                    onClick={() => setSelectedOption('cod')}
                                >
                                    <div style={styles.iconBox}><FaMoneyBillWave color="#2e7d32" /></div>
                                    <div style={{flex: 1}}>
                                        <span style={{fontWeight: selectedOption === 'cod' ? '600' : '400'}}>Cash on Delivery</span>
                                        <p style={{...styles.optionSmall, marginLeft: 0}}>Pay when you receive</p>
                                    </div>
                                    {selectedOption === 'cod' && <div style={styles.checkedCircle}></div>}
                                </div>
                            </div>

                            <div style={styles.footer}>
                                <button 
                                    onClick={() => handleMockPayment(true)} 
                                    style={{
                                        ...styles.payBtn,
                                        background: selectedOption === 'cod' ? '#2e7d32' : '#3392fd',
                                        boxShadow: selectedOption === 'cod' ? '0 4px 10px rgba(46, 125, 50, 0.3)' : '0 4px 10px rgba(51, 146, 253, 0.3)'
                                    }}
                                    disabled={isProcessing}
                                >
                                    {selectedOption === 'cod' ? `Place Order (COD)` : `Pay (₹${totalAmount?.toFixed(2)})`}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        backdropFilter: 'blur(5px)'
    },
    modal: {
        width: '100%',
        maxWidth: '450px',
        background: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        position: 'relative'
    },
    modalContent: {
        transition: 'filter 0.3s'
    },
    processingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(255, 255, 255, 0.85)',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
        textAlign: 'center',
        padding: '2rem'
    },
    loaderContainer: {
        position: 'relative',
        width: '80px',
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem'
    },
    pulseRing: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        background: '#3392fd'
    },
    mainLoader: {
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        border: '3px solid #f3f3f3',
        borderTop: '3px solid #3392fd'
    },
    lockIcon: {
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    processingText: {
        fontSize: '1.2rem',
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: '0.5rem',
        minHeight: '1.6rem'
    },
    processingSubText: {
        fontSize: '0.85rem',
        color: '#666'
    },
    header: {
        background: '#1a1a1a',
        padding: '1.2rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'white'
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
    },
    logo: {
        height: '24px',
        filter: 'brightness(0) invert(1)'
    },
    divider: {
        width: '1px',
        height: '24px',
        background: 'rgba(255,255,255,0.2)'
    },
    amount: {
        fontSize: '1.1rem',
        fontWeight: '700'
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        color: 'white',
        cursor: 'pointer',
        fontSize: '1.2rem',
        opacity: 0.7,
        transition: 'opacity 0.3s',
        '&:hover': { opacity: 1 }
    },
    body: {
        padding: '1.5rem'
    },
    secureHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        padding: '0.8rem',
        background: '#f8f9fa',
        borderRadius: '8px',
        marginBottom: '1.5rem'
    },
    secureText: {
        fontSize: '0.85rem',
        color: '#4caf50',
        fontWeight: '600'
    },
    sectionTitle: {
        fontSize: '0.9rem',
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: '1rem',
        fontWeight: '700'
    },
    paymentOptions: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem',
        marginBottom: '1.5rem'
    },
    option: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        border: '1px solid #eee',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.3s',
        '&:hover': { background: '#f8f9fa', borderColor: '#ddd' }
    },
    iconBox: {
        width: '40px',
        fontSize: '1.4rem',
        display: 'flex',
        justifyContent: 'center'
    },
    optionSmall: {
        fontSize: '0.75rem',
        color: '#999',
        marginLeft: 'auto'
    },
    checkedCircle: {
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        background: '#3392fd',
        border: '3px solid #f0f7ff',
        boxShadow: '0 0 0 1px #3392fd'
    },
    demoWarning: {
        padding: '1rem',
        background: '#fff9c4',
        borderRadius: '8px',
        border: '1px solid #fff176',
        marginBottom: '1.5rem',
        fontSize: '0.85rem',
        color: '#827717'
    },
    footer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem'
    },
    payBtn: {
        padding: '1rem',
        background: '#3392fd',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '700',
        fontSize: '1rem',
        cursor: 'pointer',
        boxShadow: '0 4px 10px rgba(51, 146, 253, 0.3)',
        transition: 'background 0.3s'
    },
    failBtn: {
        padding: '0.6rem',
        background: 'none',
        color: '#dc3545',
        border: '1px solid #dc3545',
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: '0.85rem',
        cursor: 'pointer',
        transition: 'all 0.3s'
    }
};

export default PaymentModal;
