import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import FoodCard from '../components/FoodCard';
import { motion } from 'framer-motion';

const Menu = () => {
    const [foods, setFoods] = useState([]);
    const [filteredFoods, setFilteredFoods] = useState([]);
    const [activeCategory, setActiveCategory] = useState('All');
    const [activeFoodType, setActiveFoodType] = useState('All');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('q') || '';

    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    useEffect(() => {
        const fetchFoods = async () => {
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/foods`);
                // Only shuffle and set foods that have a name, price, and image
                const validFoods = data.filter(item => item.name && item.price && item.image);
                const randomizedData = shuffleArray(validFoods);
                setFoods(randomizedData);
                const uniqueCategories = ['All', ...new Set(randomizedData.map(item => item.category))];
                setCategories(uniqueCategories);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching foods:', error);
                setLoading(false);
            }
        };

        fetchFoods();
    }, []);

    useEffect(() => {
        let result = foods;
        
        // Search Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(item => 
                item.name.toLowerCase().includes(query) || 
                item.category.toLowerCase().includes(query) ||
                (item.restaurantId?.name && item.restaurantId.name.toLowerCase().includes(query))
            );
        }

        // Category Filter
        if (activeCategory !== 'All') {
            result = result.filter(item => item.category === activeCategory);
        }

        // Food Type Filter
        if (activeFoodType !== 'All') {
            result = result.filter(item => item.foodType === activeFoodType);
        }
        
        setFilteredFoods(result);
    }, [foods, activeCategory, activeFoodType, searchQuery]);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                style={{ width: '50px', height: '50px', border: '5px solid #fff', borderTop: '5px solid #ff6b6b', borderRadius: '50%' }}
            />
        </div>
    );

    return (
        <motion.div
            style={styles.container}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div style={styles.hero}>
                <motion.h1
                    style={styles.title}
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
                >
                    Taste the <span style={{ color: '#ff6b6b' }}>Extraordinary</span>
                </motion.h1>
                <motion.p
                    style={styles.subtitle}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    Hand-crafted dishes delivered right to your doorstep.
                </motion.p>
            </div>

            <div style={styles.contentWrapper} className="menu-content">
                <div style={styles.sidebar} className="menu-sidebar">
                    <div style={styles.typeFilterContainer}>
                        <button
                            onClick={() => setActiveFoodType('All')}
                            style={activeFoodType === 'All' ? styles.activeTypeBtn : styles.typeBtn}
                        >All</button>
                        <button
                            onClick={() => setActiveFoodType('Veg')}
                            style={activeFoodType === 'Veg' ? { ...styles.activeTypeBtn, backgroundColor: '#2ecc71', color: 'white' } : { ...styles.typeBtn, color: '#2ecc71', borderColor: '#2ecc71' }}
                        >Veg</button>
                        <button
                            onClick={() => setActiveFoodType('Non-Veg')}
                            style={activeFoodType === 'Non-Veg' ? { ...styles.activeTypeBtn, backgroundColor: '#e74c3c', color: 'white' } : { ...styles.typeBtn, color: '#e74c3c', borderColor: '#e74c3c' }}
                        >Non-Veg</button>
                    </div>

                    <h3 style={styles.filterTitle}>Categories</h3>
                    <div style={styles.categoryList}>
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                style={activeCategory === category ? styles.activeCategoryBtn : styles.categoryBtn}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={styles.grid}>
                    {filteredFoods.map((food) => (
                        <FoodCard key={food._id} food={food} />
                    ))}
                </div>
            </div>
            <style>{`
                @media (max-width: 992px) {
                    .menu-content {
                        flex-direction: column !important;
                    }
                    .menu-sidebar {
                        width: 100% !important;
                        position: static !important;
                        margin-bottom: 2rem !important;
                    }
                }
                @media (max-width: 768px) {
                    h1 { font-size: 2.5rem !important; }
                }
            `}</style>
        </motion.div>
    );
};

const styles = {
    container: {
        padding: '1rem 5%',
        maxWidth: '1400px',
        margin: '0 auto',
        minHeight: '80vh',
    },
    hero: {
        textAlign: 'center',
        padding: '2.5rem 1.5rem',
        marginBottom: '2rem',
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(10px)',
        borderRadius: '25px',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    },
    title: {
        fontSize: '3rem',
        marginBottom: '0.5rem',
        color: '#222',
        fontWeight: '800',
        lineHeight: '1.2',
    },
    subtitle: {
        color: '#555',
        fontSize: '1.1rem',
        maxWidth: '600px',
        margin: '0 auto',
        fontWeight: '500',
    },
    contentWrapper: {
        display: 'flex',
        gap: '2.5rem',
        alignItems: 'flex-start',
        transition: 'flex-direction 0.3s ease',
    },
    sidebar: {
        width: '240px',
        flexShrink: 0,
        position: 'sticky',
        top: '110px',
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '1.2rem',
        borderRadius: '20px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        backdropFilter: 'blur(10px)',
    },
    filterTitle: {
        fontSize: '1.1rem',
        marginBottom: '0.8rem',
        color: '#333',
        fontWeight: '700',
        borderBottom: '2px solid #ff6b6b',
        paddingBottom: '0.4rem',
        display: 'inline-block',
    },
    categoryList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
    },
    categoryBtn: {
        padding: '0.7rem 1.2rem',
        border: 'none',
        backgroundColor: 'transparent',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: '500',
        color: '#555',
        textAlign: 'left',
        transition: 'all 0.2s ease',
    },
    activeCategoryBtn: {
        padding: '0.7rem 1.2rem',
        border: 'none',
        backgroundColor: '#ff6b6b',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: '600',
        color: '#fff',
        textAlign: 'left',
        boxShadow: '0 4px 10px rgba(255, 107, 107, 0.3)',
    },
    grid: {
        flex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '2rem',
        width: '100%',
    },
    typeFilterContainer: {
        display: 'flex',
        gap: '0.4rem',
        marginBottom: '1.5rem',
        padding: '0.4rem',
        background: 'rgba(0,0,0,0.02)',
        borderRadius: '10px',
    },
    typeBtn: {
        flex: 1,
        padding: '0.4rem',
        border: '1px solid #eee',
        background: 'white',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '0.85rem',
        color: '#555',
    },
    activeTypeBtn: {
        flex: 1,
        padding: '0.4rem',
        border: 'none',
        background: '#333',
        color: 'white',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '0.85rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }
};

export default Menu;
