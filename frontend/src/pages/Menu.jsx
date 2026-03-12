import { useState, useEffect } from 'react';
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

    useEffect(() => {
        const fetchFoods = async () => {
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/foods`);
                setFoods(data);
                const uniqueCategories = ['All', ...new Set(data.map(item => item.category))];
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
        if (activeCategory !== 'All') {
            result = result.filter(item => item.category === activeCategory);
        }
        if (activeFoodType !== 'All') {
            result = result.filter(item => item.foodType === activeFoodType);
        }
        setFilteredFoods(result);
    }, [foods, activeCategory, activeFoodType]);

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

            <div style={styles.contentWrapper}>
                <div style={styles.sidebar}>
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
        </motion.div>
    );
};

const styles = {
    container: {
        padding: '2rem 5%',
        maxWidth: '1400px',
        margin: '0 auto',
        minHeight: '80vh',
    },
    hero: {
        textAlign: 'center',
        padding: '3rem 2rem',
        marginBottom: '3rem',
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(10px)',
        borderRadius: '30px',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
    },
    title: {
        fontSize: '3.5rem',
        marginBottom: '0.5rem',
        color: '#222',
        fontWeight: '800',
        textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
        lineHeight: '1.2',
    },
    subtitle: {
        color: '#555',
        fontSize: '1.2rem',
        maxWidth: '600px',
        margin: '0 auto',
        fontWeight: '500',
    },
    contentWrapper: {
        display: 'flex',
        gap: '3rem',
        alignItems: 'flex-start',
    },
    sidebar: {
        width: '250px',
        flexShrink: 0,
        position: 'sticky',
        top: '120px',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '1.5rem',
        borderRadius: '20px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        backdropFilter: 'blur(10px)',
    },
    filterTitle: {
        fontSize: '1.2rem',
        marginBottom: '1rem',
        color: '#333',
        fontWeight: '700',
        borderBottom: '2px solid #ff6b6b',
        paddingBottom: '0.5rem',
        display: 'inline-block',
    },
    categoryList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem',
    },
    categoryBtn: {
        padding: '0.8rem 1.5rem',
        border: 'none',
        backgroundColor: 'transparent',
        borderRadius: '12px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '500',
        color: '#555',
        textAlign: 'left',
        transition: 'all 0.3s ease',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    activeCategoryBtn: {
        padding: '0.8rem 1.5rem',
        border: 'none',
        backgroundColor: '#ff6b6b',
        borderRadius: '12px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '600',
        color: '#fff',
        textAlign: 'left',
        boxShadow: '0 4px 10px rgba(255, 107, 107, 0.4)',
        transition: 'all 0.3s ease',
    },
    grid: {
        flex: 1,
        display: 'flex',
        flexWrap: 'wrap',
        gap: '2rem',
        justifyContent: 'center',
    },
    typeFilterContainer: {
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        padding: '0.5rem',
        background: 'rgba(0,0,0,0.03)',
        borderRadius: '12px',
    },
    typeBtn: {
        flex: 1,
        padding: '0.5rem',
        border: '1px solid #ddd',
        background: 'white',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '0.9rem',
        transition: 'all 0.2s',
        color: '#555',
    },
    activeTypeBtn: {
        flex: 1,
        padding: '0.5rem',
        border: 'none',
        background: '#333',
        color: 'white',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '0.9rem',
        transition: 'all 0.2s',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }
};

export default Menu;
