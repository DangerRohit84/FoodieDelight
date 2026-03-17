import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CartContext from '../context/CartContext';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash, FaShoppingBag, FaArrowLeft, FaHome, FaBriefcase } from 'react-icons/fa';

const Cart = () => {
    const { cartItems, removeFromCart, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressIndex, setSelectedAddressIndex] = useState(-1); // -1 for new address
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [newAddress, setNewAddress] = useState({
        label: 'HOME',
        address: '',
        city: '',
        postalCode: '',
        country: '',
        phone: ''
    });

    const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

    // Fetch user addresses on mount
    useEffect(() => {
        if (user && user.token) {
            fetchUserProfile();
        }
    }, [user]);

    const fetchUserProfile = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`, config);
            setSavedAddresses(data.addresses);
            if (data.addresses.length > 0) {
                setSelectedAddressIndex(0); // Select first address by default
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const handleCheckout = async () => {
        if (!user) {
            toast.error('Please login to place an order');
            navigate('/login');
            return;
        }

        let shippingAddress;

        if (selectedAddressIndex === -1) {
            // Validate new address
            const { address, city, postalCode, country, phone } = newAddress;
            if (!address || !city || !postalCode || !country || !phone) {
                toast.error('Please fill in all shipping fields');
                return;
            }
            shippingAddress = newAddress;

            // Save new address to profile
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                await axios.post(`${import.meta.env.VITE_API_URL}/api/users/address`, newAddress, config);
            } catch (error) {
                console.error('Failed to save address:', error);
            }

        } else {
            shippingAddress = savedAddresses[selectedAddressIndex];
        }

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            };

            // Group cart items by restaurantId
            const orderGroups = {};
            cartItems.forEach(item => {
                // Determine restaurant ID (fallback to user's id if old food data without restaurantId)
                const restId = item.restaurantId ? (item.restaurantId._id || item.restaurantId) : user._id;

                if (!orderGroups[restId]) {
                    orderGroups[restId] = [];
                }
                orderGroups[restId].push(item);
            });

            // Create separate orders for each restaurant group
            const orderPromises = Object.keys(orderGroups).map(restaurantId => {
                const items = orderGroups[restaurantId];
                const groupTotalPrice = items.reduce((acc, current) => acc + (current.price * current.qty), 0);

                const groupOrderItems = items.map(item => ({
                    name: item.name,
                    qty: item.qty,
                    image: item.image,
                    price: item.price,
                    food: item._id,
                }));

                const orderPayload = {
                    orderItems: groupOrderItems,
                    totalPrice: groupTotalPrice,
                    shippingAddress,
                    restaurantId
                };

                return axios.post(`${import.meta.env.VITE_API_URL}/api/orders`, orderPayload, config);
            });

            await Promise.all(orderPromises);

            toast.success('Order(s) placed successfully! 🍕');
            clearCart();
            navigate('/myorders');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Order failed');
        }
    };

    if (cartItems.length === 0) {
        return (
            <div style={styles.pageWrapper}>
                <div style={styles.container}>
                    <h2 style={styles.title}>Your Cart</h2>
                    <div style={styles.emptyCart}>
                        <FaShoppingBag style={{ fontSize: '4rem', color: '#888', marginBottom: '1rem' }} />
                        <p>Your cart is currently empty.</p>
                        <button onClick={() => navigate('/menu')} style={styles.backButton}>
                            <FaArrowLeft /> Return to Menu
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.pageWrapper}>
            <motion.div
                style={styles.container}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h2 style={styles.title}>Your Cart</h2>

                <div style={styles.contentWrapper}>
                    <div style={styles.list}>
                        <AnimatePresence>
                            {cartItems.map((item) => (
                                <motion.div
                                    key={item._id}
                                    style={styles.item}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    layout
                                >
                                    <img src={item.image} alt={item.name} style={styles.image} />
                                    <div style={styles.details}>
                                        <h4 style={styles.itemName}>{item.name}</h4>
                                        <p style={styles.itemPrice}>₹{item.price.toFixed(2)} x {item.qty} = <b>₹{(item.price * item.qty).toFixed(2)}</b></p>
                                    </div>
                                    <motion.button
                                        onClick={() => removeFromCart(item._id)}
                                        style={styles.removeButton}
                                        whileHover={{ scale: 1.1, color: '#d32f2f' }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <FaTrash />
                                    </motion.button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <div style={styles.checkoutSection}>
                        <div style={styles.formContainer}>
                            <h3 style={styles.formTitle}>Delivery Address</h3>

                            <div style={styles.deliveryPreview}>
                                <div style={styles.deliveryContent}>
                                    <span style={styles.deliverToText}>Deliver to </span>
                                    {selectedAddressIndex !== -1 && savedAddresses[selectedAddressIndex] ? (
                                        <>
                                            <span style={styles.selectedAddressLabel}>
                                                {savedAddresses[selectedAddressIndex].label || 'HOME'}
                                            </span>
                                            <p style={styles.selectedAddressDetail}>
                                                {savedAddresses[selectedAddressIndex].address}, {savedAddresses[selectedAddressIndex].city}
                                            </p>
                                        </>
                                    ) : (
                                        <span style={{ color: '#ff6b6b', fontWeight: 'bold' }}>Please add/select an address</span>
                                    )}
                                </div>
                                <button
                                    style={styles.changeBtn}
                                    onClick={() => setShowAddressModal(!showAddressModal)}
                                >
                                    Change
                                </button>
                            </div>

                            {showAddressModal && (
                                <div style={styles.addressModal}>
                                    <h4 style={{ marginBottom: '1rem' }}>Select Address</h4>
                                    {savedAddresses.map((addr, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                ...styles.addressOption,
                                                borderColor: selectedAddressIndex === index ? '#ff6b6b' : '#eee',
                                                background: selectedAddressIndex === index ? '#fff5f5' : 'white'
                                            }}
                                            onClick={() => {
                                                setSelectedAddressIndex(index);
                                                setShowAddressModal(false);
                                            }}
                                        >
                                            <div style={styles.optionLabel}>
                                                {addr.label === 'HOME' && <FaHome color="#ff6b6b" />}
                                                {addr.label === 'OFFICE' && <FaBriefcase color="#ff6b6b" />}
                                                <span>{addr.label}</span>
                                            </div>
                                            <p style={{ fontSize: '0.9rem', color: '#555' }}>{addr.address}, {addr.city}</p>
                                        </div>
                                    ))}
                                    <div
                                        style={{
                                            ...styles.addressOption,
                                            borderColor: selectedAddressIndex === -1 ? '#ff6b6b' : '#eee',
                                            background: selectedAddressIndex === -1 ? '#fff5f5' : 'white'
                                        }}
                                        onClick={() => {
                                            setSelectedAddressIndex(-1);
                                            setShowAddressModal(false);
                                        }}
                                    >
                                        <strong>+ Add New Address</strong>
                                    </div>
                                </div>
                            )}

                            {selectedAddressIndex === -1 && (
                                <div style={styles.newAddressForm}>
                                    <div style={styles.radioGroup}>
                                        <label style={styles.radioLabel}>
                                            <input
                                                type="radio"
                                                name="addressLabel"
                                                checked={newAddress.label === 'HOME'}
                                                onChange={() => setNewAddress({ ...newAddress, label: 'HOME' })}
                                            /> HOME
                                        </label>
                                        <label style={styles.radioLabel}>
                                            <input
                                                type="radio"
                                                name="addressLabel"
                                                checked={newAddress.label === 'OFFICE'}
                                                onChange={() => setNewAddress({ ...newAddress, label: 'OFFICE' })}
                                            /> OFFICE
                                        </label>
                                    </div>
                                    <textarea
                                        placeholder="Address (Street, Apt, etc.)"
                                        value={newAddress.address}
                                        onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                                        style={styles.textarea} required
                                    />
                                    <div style={styles.row}>
                                        <input
                                            placeholder="City"
                                            value={newAddress.city}
                                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                            style={styles.halfInput} required
                                        />
                                        <input
                                            placeholder="Postal Code"
                                            value={newAddress.postalCode}
                                            onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                                            style={styles.halfInput} required
                                        />
                                    </div>
                                    <div style={styles.row}>
                                        <input
                                            placeholder="Country"
                                            value={newAddress.country}
                                            onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                                            style={styles.halfInput} required
                                        />
                                        <input
                                            placeholder="Phone Number"
                                            value={newAddress.phone}
                                            onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                                            style={styles.halfInput} required
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <motion.div
                            style={styles.summary}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h3>Order Summary</h3>
                            <div style={styles.summaryRow}>
                                <span>Subtotal</span>
                                <span>₹{totalPrice.toFixed(2)}</span>
                            </div>
                            <div style={styles.summaryRow}>
                                <span>Delivery Fee</span>
                                <span>₹0.00</span>
                            </div>
                            <div style={styles.divider}></div>
                            <div style={styles.totalRow}>
                                <span>Total</span>
                                <span>₹{totalPrice.toFixed(2)}</span>
                            </div>
                            <motion.button
                                onClick={handleCheckout}
                                style={styles.checkoutButton}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Proceed to Checkout
                            </motion.button>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
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
        textShadow: '1px 1px 2px rgba(255, 255, 255, 0.5)',
    },
    emptyCart: {
        textAlign: 'center',
        padding: '4rem',
        color: '#555',
        fontSize: '1.2rem',
        background: 'rgba(255, 255, 255, 0.5)',
        borderRadius: '15px',
    },
    backButton: {
        marginTop: '1.5rem',
        padding: '0.8rem 1.5rem',
        backgroundColor: '#333',
        color: 'white',
        border: 'none',
        borderRadius: '50px',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '1rem',
        transition: 'all 0.3s',
    },
    contentWrapper: {
        display: 'flex',
        gap: '3rem',
        flexWrap: 'wrap',
    },
    list: {
        flex: 2,
        minWidth: '300px',
    },
    item: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '1rem',
        borderRadius: '12px',
        marginBottom: '1rem',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
    },
    image: {
        width: '80px',
        height: '80px',
        objectFit: 'cover',
        borderRadius: '8px',
    },
    details: {
        flexGrow: 1,
        marginLeft: '1.5rem',
    },
    itemName: {
        fontSize: '1.1rem',
        marginBottom: '0.3rem',
        color: '#333',
        fontWeight: '600',
    },
    itemPrice: {
        color: '#666',
        fontWeight: '500',
    },
    removeButton: {
        backgroundColor: 'transparent',
        color: '#ff6b6b',
        border: 'none',
        padding: '0.8rem',
        cursor: 'pointer',
        fontSize: '1.1rem',
    },
    checkoutSection: {
        flex: 1,
        minWidth: '300px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
    },
    formContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '2rem',
        borderRadius: '16px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
    },
    formTitle: {
        fontSize: '1.2rem',
        marginBottom: '1rem',
        color: '#333',
        fontWeight: '600',
    },
    radioLabel: {
        display: 'flex',
        alignItems: 'center',
        marginRight: '1rem',
        fontWeight: '500',
        cursor: 'pointer',
    },
    deliveryPreview: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#fff',
        padding: '1rem',
        borderRadius: '12px',
        border: '1px solid #eee',
        marginBottom: '1.5rem',
    },
    deliveryContent: {
        flex: 1,
    },
    deliverToText: {
        fontSize: '1rem',
        color: '#555',
        fontWeight: '500',
    },
    selectedAddressLabel: {
        background: '#f0f0f0',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        color: '#666',
        marginLeft: '0.5rem',
        textTransform: 'uppercase',
    },
    selectedAddressDetail: {
        fontSize: '0.9rem',
        color: '#333',
        marginTop: '0.3rem',
        fontWeight: '600',
    },
    changeBtn: {
        background: '#fff',
        border: '1px solid #ddd',
        color: '#1a73e8',
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    addressModal: {
        background: '#f9f9f9',
        padding: '1rem',
        borderRadius: '12px',
        border: '1px solid #ddd',
        marginBottom: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem',
    },
    addressOption: {
        padding: '0.8rem',
        borderRadius: '8px',
        border: '2px solid #eee',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    optionLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        color: '#666',
        marginBottom: '0.2rem',
        textTransform: 'uppercase',
    },
    radioGroup: {
        display: 'flex',
        marginBottom: '1rem',
    },
    select: {
        width: '100%',
        padding: '0.8rem',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '1rem',
        marginTop: '0.5rem',
        outline: 'none',
    },
    newAddressForm: {
        marginTop: '1rem',
    },
    input: {
        width: '100%',
        padding: '0.8rem',
        marginBottom: '1rem',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '1rem',
        outline: 'none',
    },
    textarea: {
        width: '100%',
        padding: '0.8rem',
        marginBottom: '1rem',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '1rem',
        outline: 'none',
        minHeight: '80px',
        fontFamily: 'inherit',
    },
    row: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '1rem',
        flexWrap: 'wrap',
    },
    halfInput: {
        flex: 1,
        minWidth: '120px',
        padding: '0.8rem',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '1rem',
        outline: 'none',
    },
    summary: {
        flex: 1,
        minWidth: '280px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '2rem',
        borderRadius: '16px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        alignSelf: 'flex-start',
        border: '1px solid rgba(255, 255, 255, 0.5)',
    },
    summaryRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '1rem',
        color: '#555',
        fontWeight: '500',
    },
    divider: {
        height: '1px',
        backgroundColor: '#ddd',
        margin: '1rem 0',
    },
    totalRow: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '1.4rem',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '2rem',
    },
    checkoutButton: {
        width: '100%',
        padding: '1rem',
        backgroundColor: '#ff6b6b',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        fontSize: '1.1rem',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 4px 10px rgba(255, 107, 107, 0.3)',
        transition: 'background 0.3s',
    }
};

export default Cart;
