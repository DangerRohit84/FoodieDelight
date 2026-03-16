import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaChevronRight, FaStar, FaClock, FaTruck, FaUtensils, FaMobileAlt, FaBoxOpen, FaQuoteLeft } from 'react-icons/fa';
import heroImage from '../assets/hero_food.png';

const Home = () => {
    const fadeIn = {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    };

    return (
        <div style={styles.container}>
            {/* Hero Section */}
            <section style={styles.hero} className="hero-section">
                <motion.div 
                    style={styles.heroContent}
                    className="hero-content"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <motion.span 
                        style={styles.badge}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        🚀 Fast & Delicious Delivery
                    </motion.span>
                    <h1 style={styles.title}>
                        Savor Every <span style={{ color: '#ff6b6b' }}>Bite</span>, <br />
                        Delivered to Your <span style={{ color: '#ff6b6b' }}>Door</span>.
                    </h1>
                    <p style={styles.subtitle}>
                        Discover the best local restaurants and get your favorite meals delivered fresh and fast. Experience gourmet dining from the comfort of your home.
                    </p>
                    <div style={styles.ctaGroup}>
                        <Link to="/menu" style={styles.primaryBtn}>
                            Explore Menu <FaChevronRight style={{ marginLeft: '8px' }} />
                        </Link>
                        <Link to="/partner" style={styles.secondaryBtn}>
                            Partner With Us
                        </Link>
                    </div>
                </motion.div>
                
                <motion.div 
                    style={styles.heroImageContainer}
                    className="hero-image-container"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                >
                    <img src={heroImage} alt="Delicious food spread" style={styles.heroImage} />
                    <motion.div 
                        style={styles.floatingCard1}
                        className="floating-card"
                        animate={{ y: [0, -20, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <FaStar style={{ color: '#f1c40f' }} /> 4.9 Rating
                    </motion.div>
                    <motion.div 
                        style={styles.floatingCard2}
                        className="floating-card"
                        animate={{ y: [0, 20, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <FaClock style={{ color: '#3498db' }} /> 25 Min Delivery
                    </motion.div>
                </motion.div>
            </section>

            {/* Features Section */}
            <motion.section style={styles.features} {...fadeIn}>
                <div style={styles.featureCard}>
                    <div style={styles.featureIconContainer}><FaTruck /></div>
                    <h3>Fastest Delivery</h3>
                    <p>Get your food delivered in under 30 minutes, guaranteed.</p>
                </div>
                <div style={styles.featureCard}>
                    <div style={styles.featureIconContainer}><FaUtensils /></div>
                    <h3>Curated Restaurants</h3>
                    <p>Only the highest-rated local spots for your enjoyment.</p>
                </div>
                <div style={styles.featureCard}>
                    <div style={{...styles.featureIconContainer, background: '#ff6b6b'}}>
                        <FaStar style={{ color: 'white' }} />
                    </div>
                    <h3>Quality Focused</h3>
                    <p>Fresh ingredients and expert preparation in every meal.</p>
                </div>
            </motion.section>

            {/* How It Works Section */}
            <section style={styles.section}>
                <motion.h2 style={styles.sectionTitle} {...fadeIn}>How It <span style={{ color: '#ff6b6b' }}>Works</span></motion.h2>
                <div style={styles.stepsContainer}>
                    <motion.div style={styles.stepCard} {...fadeIn} transition={{ delay: 0.2 }}>
                        <div style={styles.stepIcon}><FaMobileAlt /></div>
                        <h4>1. Place an Order</h4>
                        <p>Browse our extensive menu and select your favorite dishes.</p>
                    </motion.div>
                    <motion.div style={styles.stepCard} {...fadeIn} transition={{ delay: 0.4 }}>
                        <div style={styles.stepIcon}><FaUtensils /></div>
                        <h4>2. Chef Prepares</h4>
                        <p>Our expert chefs prepare your meal with the finest ingredients.</p>
                    </motion.div>
                    <motion.div style={styles.stepCard} {...fadeIn} transition={{ delay: 0.6 }}>
                        <div style={styles.stepIcon}><FaBoxOpen /></div>
                        <h4>3. Quick Delivery</h4>
                        <p>Our delivery experts bring your food fresh to your doorstep.</p>
                    </motion.div>
                </div>
            </section>

            {/* Popular Categories */}
            <section style={{...styles.section, background: 'rgba(255, 107, 107, 0.05)'}}>
                <motion.h2 style={styles.sectionTitle} {...fadeIn}>Explore <span style={{ color: '#ff6b6b' }}>Cuisines</span></motion.h2>
                <div style={styles.cuisineGrid} className="cuisine-grid">
                    {['Pizza', 'Burgers', 'Sushi', 'Pasta', 'Desserts', 'Healthy'].map((cat, i) => (
                        <motion.div 
                            key={cat} 
                            style={styles.cuisineCard} 
                            {...fadeIn} 
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                        >
                            <span style={styles.cuisineEmoji}>{i === 0 ? '🍕' : i === 1 ? '🍔' : i === 2 ? '🍣' : i === 3 ? '🍝' : i === 4 ? '🍰' : '🥗'}</span>
                            <h5>{cat}</h5>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Testimonials Section */}
            <section style={styles.section}>
                <motion.h2 style={styles.sectionTitle} {...fadeIn}>What Our <span style={{ color: '#ff6b6b' }}>Foodies</span> Say</motion.h2>
                <div style={styles.testimonialGrid} className="testimonial-grid">
                    <motion.div style={styles.testimonialCard} {...fadeIn}>
                        <FaQuoteLeft style={styles.quoteIcon} />
                        <p>"The fastest delivery service I've ever used. The food arrived piping hot and tasted absolutely amazing!"</p>
                        <div style={styles.testimonialUser}>
                            <strong>Sarah Jenkins</strong>
                            <span>Regular Customer</span>
                        </div>
                    </motion.div>
                    <motion.div style={styles.testimonialCard} {...fadeIn} transition={{ delay: 0.2 }}>
                        <FaQuoteLeft style={styles.quoteIcon} />
                        <p>"I love the variety of restaurants available. It's so easy to discover new cuisines right from the app."</p>
                        <div style={styles.testimonialUser}>
                            <strong>Michael Chen</strong>
                            <span>Food Blogger</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Partner CTA Section */}
            <motion.section style={styles.partnerCTA} className="partner-cta" {...fadeIn}>
                <div style={styles.ctaContent} className="cta-content">
                    <h2>Own a Restaurant?</h2>
                    <p>Join our growing network of partners and reach thousands of new customers every day.</p>
                </div>
                <Link to="/partner" style={styles.partnerBtn}>
                    Become a Partner <FaChevronRight style={{ marginLeft: '10px' }} />
                </Link>
            </motion.section>

            <style>{`
                @media (max-width: 1200px) {
                    h1 { font-size: 3.5rem !important; }
                }
                @media (max-width: 992px) {
                    .hero-section { flex-direction: column !important; text-align: center !important; }
                    .hero-content { min-width: 100% !important; }
                    .hero-image-container { min-width: 100% !important; margin-top: 3rem !important; }
                    .cta-group { justify-content: center !important; }
                    .subtitle { margin-left: auto !important; margin-right: auto !important; }
                    .partner-cta { padding: 2rem !important; flex-direction: column !important; text-align: center !important; }
                    .cta-content { text-align: center !important; margin-bottom: 2rem !important; }
                }
                @media (max-width: 768px) {
                    h1 { font-size: 2.5rem !important; }
                    h2 { font-size: 2rem !important; }
                    .floating-card { display: none !important; }
                    .cuisine-grid { grid-template-columns: repeat(2, 1fr) !important; }
                    .testimonial-grid { grid-template-columns: 1fr !important; }
                    .step-card { min-width: 100% !important; }
                }
                @media (max-width: 480px) {
                    h1 { font-size: 2.2rem !important; }
                    .primary-btn, .secondary-btn { width: 100% !important; justify-content: center !important; }
                }
            `}</style>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        background: '#ffffff',
        padding: '0 5% 8rem 5%',
    },
    hero: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '4rem',
        minHeight: '85vh',
        flexWrap: 'wrap',
        padding: '4rem 0',
    },
    heroContent: {
        flex: 1,
    },
    badge: {
        display: 'inline-block',
        padding: '0.6rem 1.4rem',
        background: 'rgba(255, 107, 107, 0.1)',
        color: '#ff6b6b',
        borderRadius: '50px',
        fontWeight: '800',
        fontSize: '0.85rem',
        marginBottom: '1.5rem',
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
    },
    title: {
        fontSize: '4rem',
        fontWeight: '900',
        color: '#1a1a1a',
        lineHeight: '1.1',
        marginBottom: '1.5rem',
    },
    subtitle: {
        fontSize: '1.15rem',
        color: '#555',
        marginBottom: '2.5rem',
        lineHeight: '1.7',
        maxWidth: '520px',
    },
    ctaGroup: {
        display: 'flex',
        gap: '1.2rem',
        flexWrap: 'wrap',
        marginTop: '2rem',
    },
    primaryBtn: {
        padding: '1.1rem 2.4rem',
        background: '#ff6b6b',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '50px',
        fontWeight: '700',
        fontSize: '1.1rem',
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 10px 25px rgba(255, 107, 107, 0.4)',
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
    secondaryBtn: {
        padding: '1.1rem 2.4rem',
        background: 'white',
        color: '#1a1a1a',
        textDecoration: 'none',
        borderRadius: '50px',
        fontWeight: '700',
        fontSize: '1.1rem',
        border: '2px solid #eee',
        transition: 'all 0.3s',
    },
    heroImageContainer: {
        flex: 1.2,
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
    },
    heroImage: {
        width: '100%',
        maxWidth: '580px',
        borderRadius: '40px',
        boxShadow: '0 30px 70px rgba(0,0,0,0.15)',
    },
    floatingCard1: {
        position: 'absolute',
        top: '12%',
        left: '-8%',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        padding: '1.2rem 1.8rem',
        borderRadius: '24px',
        boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
        fontWeight: '800',
        zIndex: 2,
    },
    floatingCard2: {
        position: 'absolute',
        bottom: '18%',
        right: '-5%',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        padding: '1.2rem 1.8rem',
        borderRadius: '24px',
        boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
        fontWeight: '800',
        zIndex: 2,
    },
    section: {
        padding: '6rem 0',
        textAlign: 'center',
        margin: '0 -5%',
        paddingLeft: '5%',
        paddingRight: '5%',
    },
    sectionTitle: {
        fontSize: '2.5rem',
        fontWeight: '900',
        color: '#1a1a1a',
        marginBottom: '3.5rem',
    },
    features: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2.5rem',
        padding: '4rem 0',
    },
    featureCard: {
        background: 'white',
        padding: '3rem 2rem',
        borderRadius: '30px',
        textAlign: 'center',
        boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
        border: '1px solid #f0f0f0',
    },
    featureIconContainer: {
        width: '75px',
        height: '75px',
        background: 'rgba(255, 107, 107, 0.08)',
        color: '#ff6b6b',
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '2rem',
        margin: '0 auto 2rem auto',
    },
    stepsContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '2rem',
    },
    stepCard: {
        flex: 1,
        minWidth: '250px',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    stepIcon: {
        fontSize: '2.5rem',
        color: '#ff6b6b',
        marginBottom: '1.5rem',
        opacity: 0.8,
    },
    cuisineGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '1.5rem',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    cuisineCard: {
        background: 'white',
        padding: '2rem 1.5rem',
        borderRadius: '24px',
        cursor: 'pointer',
        boxShadow: '0 8px 20px rgba(255,107,107,0.05)',
        transition: 'all 0.3s ease',
    },
    cuisineEmoji: {
        fontSize: '2.5rem',
        display: 'block',
        marginBottom: '1rem',
    },
    testimonialGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '2.5rem',
        maxWidth: '1000px',
        margin: '0 auto',
    },
    testimonialCard: {
        background: 'white',
        padding: '2.5rem',
        borderRadius: '32px',
        textAlign: 'left',
        boxShadow: '0 15px 45px rgba(0,0,0,0.05)',
        position: 'relative',
    },
    quoteIcon: {
        color: 'rgba(255, 107, 107, 0.15)',
        fontSize: '3rem',
        position: 'absolute',
        top: '1.5rem',
        right: '2rem',
    },
    testimonialUser: {
        marginTop: '2rem',
        borderTop: '1px solid #eee',
        paddingTop: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
    },
    partnerCTA: {
        background: '#1a1a1a',
        borderRadius: '40px',
        padding: '4rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'white',
        marginTop: '4rem',
        flexWrap: 'wrap',
        gap: '2.5rem',
    },
    ctaContent: {
        flex: 1,
        maxWidth: '500px',
        textAlign: 'left',
    },
    partnerBtn: {
        padding: '1.2rem 2.8rem',
        background: 'white',
        color: '#1a1a1a',
        textDecoration: 'none',
        borderRadius: '50px',
        fontWeight: '800',
        fontSize: '1.1rem',
        display: 'flex',
        alignItems: 'center',
        transition: 'transform 0.3s',
    }
};

export default Home;
