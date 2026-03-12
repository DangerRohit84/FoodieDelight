import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders/myorders`, config);
                setOrders(data);
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };

        if (user && user.token) {
            fetchOrders();
        }
    }, [user]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return '#ffc107'; // Amber
            case 'Preparing': return '#17a2b8'; // Teal
            case 'Delivered': return '#28a745'; // Green
            default: return '#6c757d'; // Grey
        }
    };

    const toggleOrder = (orderId) => {
        if (expandedOrderId === orderId) {
            setExpandedOrderId(null);
        } else {
            setExpandedOrderId(orderId);
        }
    };

    const isCancelable = (order) => {
        if (order.status !== 'Pending') return false;
        const orderTime = new Date(order.createdAt).getTime();
        const currentTime = Date.now();
        return (currentTime - orderTime) <= 5 * 60 * 1000;
    };

    const handleCancelOrder = async (orderId) => {
        if (window.confirm('Are you certain you want to cancel this order? It cannot be undone.')) {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                await axios.put(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}/cancel`, {}, config);
                toast.success('Order cancelled successfully.');
                
                // Re-fetch orders to update the view
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders/myorders`, config);
                setOrders(data);
                setExpandedOrderId(null); // Close modal
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to cancel order');
            }
        }
    };

    const expandedOrder = orders.find(o => o._id === expandedOrderId);

    return (
        <div style={styles.pageWrapper}>
            <motion.div
                style={styles.container}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <h1 style={styles.title}>My Orders</h1>
                {orders.length === 0 ? (
                    <div style={styles.emptyState}>
                        <p>No orders found yet.</p>
                    </div>
                ) : (
                    <div style={styles.grid}>
                        {orders.map((order, index) => (
                            <motion.div
                                key={order._id}
                                style={styles.card}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ translateY: -5, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}
                                onClick={() => toggleOrder(order._id)}
                            >
                                <div style={styles.header}>
                                    <div>
                                        <span style={styles.label}>Order ID</span>
                                        <div style={styles.orderId}>#{order._id.substring(order._id.length - 6).toUpperCase()}</div>
                                    </div>
                                    <span style={{ ...styles.status, backgroundColor: getStatusColor(order.status) }}>
                                        {order.status}
                                    </span>
                                </div>
                                <div style={styles.divider}></div>
                                <div style={styles.body}>
                                    <div style={styles.infoRow}>
                                        <span style={styles.label}>Date</span>
                                        <span style={styles.value}>{new Date(order.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div style={styles.infoRow}>
                                        <span style={styles.label}>Total Amount</span>
                                        <span style={styles.totalPrice}>₹{order.totalPrice.toFixed(2)}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Modal rendering completely outside of transformed parents to fix fixed positioning */}
            <AnimatePresence>
                {expandedOrder && (
                    <div style={styles.modalOverlay} onClick={() => toggleOrder(expandedOrder._id)}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={styles.modalContent}
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
                        >
                            <div style={styles.modalHeader}>
                                <button style={styles.closeButton} onClick={() => toggleOrder(expandedOrder._id)}>
                                    &times; Close
                                </button>
                                <h3 style={{ margin: 0, flex: 1 }}>Order Details</h3>
                                {isCancelable(expandedOrder) && (
                                    <button onClick={() => handleCancelOrder(expandedOrder._id)} style={styles.cancelCommandBtn}>
                                        Cancel Order
                                    </button>
                                )}
                            </div>

                            <div style={styles.divider}></div>
                            <h4 style={styles.subHeading}>Items Ordered</h4>
                            <div style={styles.itemsList}>
                                {expandedOrder.orderItems.map((item, idx) => (
                                    <div key={idx} style={styles.itemRow}>
                                        <img src={item.image} alt={item.name} style={styles.itemImage} />
                                        <div style={styles.itemDetails}>
                                            <span style={styles.itemName}>{item.name}</span>
                                            <span style={styles.itemQty}>Qty: {item.qty} x ₹{item.price}</span>
                                        </div>
                                        <span style={styles.itemTotal}>₹{(item.qty * item.price).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={styles.shippingSection}>
                                <h4 style={styles.subHeading}>Shipping Details</h4>
                                <p style={styles.addressText}>
                                    {expandedOrder.shippingAddress.address}, {expandedOrder.shippingAddress.city} <br />
                                    {expandedOrder.shippingAddress.postalCode}, {expandedOrder.shippingAddress.country} <br />
                                    <strong>Phone:</strong> {expandedOrder.shippingAddress.phone}
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const styles = {
    pageWrapper: {
        padding: '3rem 5%',
        minHeight: '80vh',
        display: 'flex',
        justifyContent: 'center',
    },
    container: {
        width: '100%',
        maxWidth: '1200px',
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    },
    title: {
        fontSize: '2.5rem',
        marginBottom: '2rem',
        color: '#333',
        fontWeight: '700',
        textAlign: 'center',
    },
    emptyState: {
        textAlign: 'center',
        padding: '3rem',
        color: '#666',
        fontSize: '1.2rem',
        background: 'rgba(255,255,255,0.5)',
        borderRadius: '10px',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '2rem',
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        border: '1px solid #eee',
        transition: 'transform 0.3s, box-shadow 0.3s',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
    },
    label: {
        fontSize: '0.8rem',
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '0.2rem',
        display: 'block',
    },
    orderId: {
        fontWeight: 'bold',
        color: '#333',
        fontSize: '1rem',
    },
    status: {
        padding: '0.4rem 0.8rem',
        borderRadius: '50px',
        color: 'white',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    },
    divider: {
        height: '1px',
        backgroundColor: '#eee',
        margin: '0 0 1rem 0',
    },
    body: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem',
    },
    infoRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    value: {
        color: '#555',
        fontWeight: '500',
    },
    totalPrice: {
        fontWeight: '800',
        color: '#28a745',
        fontSize: '1.3rem',
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(5px)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '2rem',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        position: 'relative',
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: '1rem',
        gap: '1rem',
    },
    closeButton: {
        background: '#ff6b6b',
        color: 'white',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'background 0.3s',
    },
    cancelCommandBtn: {
        background: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '0.6rem 1.2rem',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background 0.3s',
        boxShadow: '0 4px 6px rgba(220, 53, 69, 0.2)'
    },
    subHeading: {
        fontSize: '0.9rem',
        color: '#777',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: '0.8rem',
        marginTop: '0.5rem',
    },
    itemsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem',
        marginBottom: '1rem',
    },
    itemRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        background: 'rgba(0,0,0,0.02)',
        padding: '0.5rem',
        borderRadius: '8px',
    },
    itemImage: {
        width: '50px',
        height: '50px',
        borderRadius: '6px',
        objectFit: 'cover',
    },
    itemDetails: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
    },
    itemName: {
        fontWeight: '600',
        color: '#333',
        fontSize: '0.95rem',
    },
    itemQty: {
        color: '#666',
        fontSize: '0.85rem',
    },
    itemTotal: {
        fontWeight: '700',
        color: '#ff6b6b',
    },
    shippingSection: {
        background: '#f8f9fa',
        padding: '1rem',
        borderRadius: '8px',
        borderLeft: '3px solid #ff6b6b'
    },
    addressText: {
        color: '#555',
        fontSize: '0.9rem',
        lineHeight: '1.5',
    }
};

export default Orders;
