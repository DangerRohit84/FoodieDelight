import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext';
import { FaShoppingCart, FaUser, FaSignOutAlt, FaUtensils } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { cartItems } = useContext(CartContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <motion.nav
            style={styles.nav}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div style={styles.logoContainer}>
                <Link to="/" style={styles.logoLink}>
                    <FaUtensils style={styles.logoIcon} />
                    <span style={styles.logoText}>Foodie<span style={{ color: '#ff6b6b' }}>Delight</span></span>
                </Link>
            </div>
            <div style={styles.links}>
                <Link to="/" style={styles.link}>Menu</Link>
                <Link to="/partner" style={styles.link}>Partner With Us</Link> {/* Added Partner With Us link */}
                {user ? (
                    <>
                        <Link to="/myorders" style={styles.link}>My Orders</Link>
                        {user.role === 'admin' && (
                            <Link to="/admin" style={styles.link}>Admin Dashboard</Link>
                        )}
                        {user.role === 'restaurant' && (
                            <Link to="/restaurant-dashboard" style={styles.link}>Restaurant Dashboard</Link>
                        )}
                        <motion.button
                            onClick={handleLogout}
                            style={styles.button}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FaSignOutAlt /> Logout
                        </motion.button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={styles.link}>Login</Link>
                        <Link to="/register" style={styles.buttonLink}>Register</Link>
                    </>
                )}
                <Link to="/cart" style={styles.cartLink}>
                    <motion.div whileHover={{ rotate: 10 }}>
                        <FaShoppingCart />
                    </motion.div>
                    {cartItems.length > 0 && (
                        <motion.span
                            style={styles.badge}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                        >
                            {cartItems.length}
                        </motion.span>
                    )}
                </Link>

                {user && (
                    <Link to="/profile" style={styles.avatarLink}>
                        <motion.div
                            style={styles.avatar}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            {user.name.charAt(0).toUpperCase()}
                        </motion.div>
                    </Link>
                )}
            </div>
        </motion.nav>
    );
};

const styles = {
    nav: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 5%',
        background: 'rgba(255, 255, 255, 0.9)', // More opaque for readability
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
    },
    logoContainer: {
        display: 'flex',
        alignItems: 'center',
    },
    logoLink: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        textDecoration: 'none',
        color: '#333',
        fontSize: '1.8rem',
        fontWeight: 'bold',
        letterSpacing: '-1px',
    },
    logoIcon: {
        color: '#ff6b6b',
        fontSize: '2rem',
    },
    logoText: {
        fontFamily: "'Poppins', sans-serif",
    },
    links: {
        display: 'flex',
        gap: '2rem',
        alignItems: 'center',
    },
    link: {
        color: '#333',
        fontSize: '1rem',
        fontWeight: '600',
        transition: 'color 0.3s',
        position: 'relative',
    },
    buttonLink: {
        padding: '0.6rem 1.5rem',
        backgroundColor: '#ff6b6b',
        color: '#fff',
        borderRadius: '50px',
        fontWeight: '600',
        transition: 'all 0.3s',
        boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)',
    },
    button: {
        backgroundColor: 'transparent',
        border: '2px solid #ff6b6b',
        color: '#ff6b6b',
        padding: '0.5rem 1.2rem',
        borderRadius: '50px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '0.3rem',
    },
    cartLink: {
        position: 'relative',
        fontSize: '1.4rem',
        color: '#333',
        display: 'flex',
        alignItems: 'center',
    },
    badge: {
        position: 'absolute',
        top: '-8px',
        right: '-10px',
        backgroundColor: '#ff6b6b',
        color: 'white',
        borderRadius: '50%',
        width: '20px',
        height: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    },
    avatarLink: {
        textDecoration: 'none',
    },
    avatar: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: '#ff6b6b',
        color: '#fff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        boxShadow: '0 4px 10px rgba(255, 107, 107, 0.3)',
        transition: 'all 0.3s',
        border: '2px solid white',
    }
};

export default Navbar;
