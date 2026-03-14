import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext';
import { FaShoppingCart, FaUser, FaSignOutAlt, FaUtensils, FaBars, FaTimes, FaSearch } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { cartItems } = useContext(CartContext);
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const location = useLocation();

    // Sync input with URL for real-time search
    React.useEffect(() => {
        const query = new URLSearchParams(location.search).get('q') || '';
        setSearchQuery(query);
    }, [location.search]);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        
        // Live search: navigate to home page if not already there, and update URL
        if (location.pathname !== '/') {
            navigate(`/?q=${encodeURIComponent(value)}`);
        } else {
            // Update URL query parameter without a full page reload or scroll reset
            navigate(`?q=${encodeURIComponent(value)}`, { replace: true });
        }
    };

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
        navigate('/login');
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
            closeMenu();
        }
    };

    return (
        <motion.nav
            style={styles.nav}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div style={styles.logoContainer}>
                <Link to="/" style={styles.logoLink} onClick={closeMenu}>
                    <FaUtensils style={styles.logoIcon} />
                    <span style={styles.logoText}>Foodie<span style={{ color: '#ff6b6b' }}>Delight</span></span>
                </Link>
            </div>

            {/* Global Search Bar */}
            <form onSubmit={handleSearchSubmit} style={styles.searchForm} className="nav-search">
                <input
                    type="text"
                    placeholder="Search food, restaurants..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    style={styles.searchInput}
                />
                <button type="submit" style={styles.searchButton}>
                    <FaSearch />
                </button>
            </form>

            {/* Hamburger Button for Mobile */}
            <button className="nav-hamburger" style={styles.hamburger} onClick={toggleMenu}>
                {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>

            <div className={`nav-links ${isMenuOpen ? 'active' : ''}`} style={{
                ...styles.links,
                ...(isMenuOpen ? styles.mobileLinksActive : styles.mobileLinksHidden)
            }}>
                <Link to="/" style={styles.link} onClick={closeMenu}>Menu</Link>
                <Link to="/partner" style={styles.link} onClick={closeMenu}>Partner With Us</Link>
                {user ? (
                    <>
                        <Link to="/myorders" style={styles.link} onClick={closeMenu}>My Orders</Link>
                        {user.role === 'admin' && (
                            <Link to="/admin" style={styles.link} onClick={closeMenu}>Admin</Link>
                        )}
                        {user.role === 'restaurant' && (
                            <Link to="/restaurant-dashboard" style={styles.link} onClick={closeMenu}>Dashboard</Link>
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
                        <Link to="/login" style={styles.link} onClick={closeMenu}>Login</Link>
                        <Link to="/register" style={styles.buttonLink} onClick={closeMenu}>Register</Link>
                    </>
                )}
                <div style={styles.iconGroup}>
                    <Link to="/cart" style={styles.cartLink} onClick={closeMenu}>
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
                        <Link to="/profile" style={styles.avatarLink} onClick={closeMenu}>
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
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
    },
    searchForm: {
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(0, 0, 0, 0.05)',
        borderRadius: '50px',
        padding: '0.3rem 1rem',
        width: '100%',
        maxWidth: '400px',
        margin: '0 1rem',
        transition: 'all 0.3s',
        border: '1px solid transparent',
    },
    searchInput: {
        background: 'none',
        border: 'none',
        outline: 'none',
        padding: '0.5rem',
        width: '100%',
        fontSize: '0.9rem',
        color: '#333',
    },
    searchButton: {
        background: 'none',
        border: 'none',
        color: '#ff6b6b',
        cursor: 'pointer',
        fontSize: '1rem',
        display: 'flex',
        alignItems: 'center',
        padding: '0.2rem',
    },
    logoContainer: {
        display: 'flex',
        alignItems: 'center',
        zIndex: 1001,
    },
    logoLink: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        textDecoration: 'none',
        color: '#333',
        fontSize: '1.6rem',
        fontWeight: 'bold',
    },
    logoIcon: { color: '#ff6b6b', fontSize: '1.8rem' },
    logoText: { fontFamily: "'Poppins', sans-serif" },
    hamburger: {
        display: 'none',
        fontSize: '1.5rem',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#333',
        zIndex: 1001,
        '@media (max-width: 768px)': { display: 'block' },
    },
    links: {
        display: 'flex',
        gap: '1.8rem',
        alignItems: 'center',
        transition: 'all 0.3s ease-in-out',
    },
    iconGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
    },
    link: {
        color: '#333',
        fontSize: '0.95rem',
        fontWeight: '600',
        transition: 'color 0.3s',
    },
    buttonLink: {
        padding: '0.5rem 1.4rem',
        backgroundColor: '#ff6b6b',
        color: '#fff',
        borderRadius: '50px',
        fontWeight: '600',
        fontSize: '0.9rem',
        boxShadow: '0 4px 15px rgba(255, 107, 107, 0.2)',
    },
    button: {
        backgroundColor: 'transparent',
        border: '2px solid #ff6b6b',
        color: '#ff6b6b',
        padding: '0.4rem 1.1rem',
        borderRadius: '50px',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '0.3rem',
    },
    cartLink: { position: 'relative', fontSize: '1.3rem', color: '#333' },
    badge: {
        position: 'absolute',
        top: '-5px',
        right: '-8px',
        backgroundColor: '#ff6b6b',
        color: 'white',
        borderRadius: '50%',
        width: '18px',
        height: '18px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '0.7rem',
        fontWeight: 'bold',
    },
    avatar: {
        width: '35px',
        height: '35px',
        borderRadius: '50%',
        backgroundColor: '#ff6b6b',
        color: '#fff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '1rem',
        fontWeight: 'bold',
        border: '2px solid white',
    },
    // Media Query emulation for React inline styles
    "@media (max-width: 768px)": {
        hamburger: { display: 'block' },
        links: {
            position: 'fixed',
            top: 0,
            right: 0,
            height: '100vh',
            width: '280px',
            background: 'white',
            flexDirection: 'column',
            padding: '80px 2rem 2rem 2rem',
            boxShadow: '-5px 0 15px rgba(0,0,0,0.1)',
            gap: '1.5rem',
            alignItems: 'flex-start',
        }
    }
};

// Add actual media queries via a style tag for the JS objects that can't easily do them
const NavbarStyles = () => (
    <style>{`
        @media (max-width: 768px) {
            .nav-hamburger { display: block !important; }
            .nav-links {
                position: fixed !important;
                top: 0 !important;
                right: -100% !important;
                height: 100vh !important;
                width: 280px !important;
                background: white !important;
                flex-direction: column !important;
                padding: 80px 2rem 2rem 2rem !important;
                box-shadow: -5px 0 15px rgba(0,0,0,0.1) !important;
                gap: 1.5rem !important;
                alignItems: flex-start !important;
                transition: right 0.3s ease-in-out !important;
            }
            .nav-links.active {
                right: 0 !important;
            }
            .nav-search {
                order: 3;
                width: 100% !important;
                margin: 0.5rem 0 0 0 !important;
                max-width: none !important;
            }
        }
        @media (min-width: 769px) {
            .nav-hamburger { display: none !important; }
        }
    `}</style>
);

// Wrapper to include the global styles
const NavbarWithStyles = () => (
    <>
        <NavbarStyles />
        <Navbar />
    </>
);

export default NavbarWithStyles;
