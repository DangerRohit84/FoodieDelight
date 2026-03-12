import React from 'react';
import { motion } from 'framer-motion';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer style={styles.footer}>
            <div style={styles.footerContainer}>
                {/* Brand Section */}
                <div style={styles.brandSection}>
                    <h2 style={styles.logo}>
                        <span style={styles.logoHighlight}>Foodie</span>Delight
                    </h2>
                    <p style={styles.brandText}>
                        Delivering happiness to your doorstep. Explore a world of flavors with our premium food ordering service. Fresh, fast, and always delicious.
                    </p>
                    <div style={styles.socialIcons}>
                        <motion.a whileHover={{ scale: 1.1, y: -2 }} href="#" style={styles.socialIcon}><FaFacebookF /></motion.a>
                        <motion.a whileHover={{ scale: 1.1, y: -2 }} href="#" style={styles.socialIcon}><FaTwitter /></motion.a>
                        <motion.a whileHover={{ scale: 1.1, y: -2 }} href="#" style={styles.socialIcon}><FaInstagram /></motion.a>
                        <motion.a whileHover={{ scale: 1.1, y: -2 }} href="#" style={styles.socialIcon}><FaLinkedinIn /></motion.a>
                    </div>
                </div>

                {/* Quick Links */}
                <div style={styles.linksSection}>
                    <h3 style={styles.sectionTitle}>Quick Links</h3>
                    <ul style={styles.linkList}>
                        <li><a href="/" style={styles.link}>Home</a></li>
                        <li><a href="/" style={styles.link}>Our Menu</a></li>
                        <li><a href="#" style={styles.link}>About Us</a></li>
                        <li><a href="#" style={styles.link}>Privacy Policy</a></li>
                        <li><a href="#" style={styles.link}>Terms of Service</a></li>
                    </ul>
                </div>

                {/* Contact Info */}
                <div style={styles.contactSection}>
                    <h3 style={styles.sectionTitle}>Contact Us</h3>
                    <ul style={styles.contactList}>
                        <li style={styles.contactItem}>
                            <FaMapMarkerAlt style={styles.contactIcon} />
                            <span>123 Foodie Lane, Flavor City, IN 400001</span>
                        </li>
                        <li style={styles.contactItem}>
                            <FaPhoneAlt style={styles.contactIcon} />
                            <span>+91 98765 43210</span>
                        </li>
                        <li style={styles.contactItem}>
                            <FaEnvelope style={styles.contactIcon} />
                            <span>support@foodiedelight.com</span>
                        </li>
                    </ul>
                </div>

                {/* Newsletter */}
                <div style={styles.newsletterSection}>
                    <h3 style={styles.sectionTitle}>Newsletter</h3>
                    <p style={styles.newsletterText}>Subscribe for exclusive discounts and latest updates right in your inbox!</p>
                    <div style={styles.inputGroup}>
                        <input type="email" placeholder="Your email address" style={styles.input} />
                        <motion.button whileHover={{ backgroundColor: '#e05959' }} style={styles.subscribeBtn}>
                            Subscribe
                        </motion.button>
                    </div>
                </div>
            </div>

            <div style={styles.footerBottom}>
                <p>&copy; {new Date().getFullYear()} FoodieDelight. All rights reserved.</p>
                <p style={styles.madeWithLove}>Crafted with <span style={{ color: '#ff6b6b' }}>♥</span> for food lovers.</p>
            </div>
        </footer>
    );
};

const styles = {
    footer: {
        backgroundColor: '#1a1c23',
        color: '#f0f0f0',
        paddingTop: '4rem',
        marginTop: 'auto', // Ensures it pushes to bottom
        position: 'relative',
        zIndex: 10,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
    },
    footerContainer: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 5%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '3rem',
        marginBottom: '3rem'
    },
    brandSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    },
    logo: {
        fontSize: '1.8rem',
        fontWeight: 'bold',
        color: '#fff',
        margin: 0
    },
    logoHighlight: {
        color: '#ff6b6b'
    },
    brandText: {
        color: '#a0aabc',
        lineHeight: '1.6',
        fontSize: '0.95rem'
    },
    socialIcons: {
        display: 'flex',
        gap: '1rem',
        marginTop: '0.5rem'
    },
    socialIcon: {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        textDecoration: 'none',
        transition: 'background-color 0.3s'
    },
    sectionTitle: {
        fontSize: '1.2rem',
        fontWeight: '600',
        marginBottom: '1.5rem',
        color: '#fff',
        position: 'relative',
        paddingBottom: '0.5rem'
    },
    linkList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem'
    },
    link: {
        color: '#a0aabc',
        textDecoration: 'none',
        transition: 'color 0.3s',
        fontSize: '0.95rem'
    },
    contactList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    },
    contactItem: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        color: '#a0aabc',
        fontSize: '0.95rem',
        lineHeight: '1.4'
    },
    contactIcon: {
        color: '#ff6b6b',
        marginTop: '3px'
    },
    newsletterSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    },
    newsletterText: {
        color: '#a0aabc',
        fontSize: '0.95rem',
        lineHeight: '1.5'
    },
    inputGroup: {
        display: 'flex',
        marginTop: '0.5rem'
    },
    input: {
        flex: 1,
        padding: '0.8rem 1rem',
        border: 'none',
        borderRadius: '4px 0 0 4px',
        outline: 'none',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: '#fff',
        fontSize: '0.9rem'
    },
    subscribeBtn: {
        padding: '0.8rem 1.2rem',
        border: 'none',
        backgroundColor: '#ff6b6b',
        color: '#fff',
        fontWeight: 'bold',
        borderRadius: '0 4px 4px 0',
        cursor: 'pointer',
        transition: 'background-color 0.3s'
    },
    footerBottom: {
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '1.5rem 5%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        color: '#808a9d',
        fontSize: '0.9rem',
        backgroundColor: '#15171c'
    },
    madeWithLove: {
        margin: 0
    }
};

export default Footer;
