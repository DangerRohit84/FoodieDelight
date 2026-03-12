import { useContext, memo } from 'react';
import CartContext from '../context/CartContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FaPlus } from 'react-icons/fa';

const FoodCard = memo(({ food }) => {
    const { addToCart } = useContext(CartContext);

    const handleAddToCart = () => {
        if (food.isAvailable === false) return;
        addToCart(food);
        toast.success(`${food.name} added to cart!`, {
            position: "bottom-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
            style: { backgroundColor: '#ff6b6b', color: 'white' }
        });
    };

    return (
        <motion.div
            style={styles.card}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "50px" }}
            transition={{ duration: 0.4 }}
            whileHover={{ scale: 1.05, translateY: -5 }}
            layout
        >
            <div style={styles.imageContainer}>
                <img src={food.image} alt={food.name} style={{ ...styles.image, filter: food.isAvailable === false ? 'grayscale(100%) opacity(0.7)' : 'none' }} loading="lazy" />
                <div style={styles.overlay}></div>
                <div style={styles.typeIndicator(food.foodType)}>
                    <div style={styles.typeDot(food.foodType)}></div>
                </div>
                {food.isAvailable === false ? (
                    <div style={styles.unavailableBadge}>Currently Unavailable</div>
                ) : (
                    <motion.button
                        onClick={handleAddToCart}
                        style={styles.addButton}
                        whileHover={{ scale: 1.1, backgroundColor: '#ff5252' }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <FaPlus />
                    </motion.button>
                )}
            </div>
            <div style={{ ...styles.content, opacity: food.isAvailable === false ? 0.6 : 1 }}>
                <div style={styles.header}>
                    <h3 style={styles.title}>{food.name}</h3>
                    <span style={styles.price}>₹{food.price.toFixed(2)}</span>
                </div>
                <p style={styles.category}>{food.category}</p>
                {food.restaurantId && food.restaurantId.name && (
                    <p style={{ fontSize: '0.85rem', color: '#666', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        🏪 {food.restaurantId.name}
                    </p>
                )}
                <p style={styles.description}>{food.description}</p>
            </div>
        </motion.div>
    );
});

const styles = {
    card: {
        background: 'rgba(255, 255, 255, 0.9)', // High opacity for readability
        backdropFilter: 'blur(5px)',
        borderRadius: '20px',
        overflow: 'hidden',
        width: '300px',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid rgba(255, 255, 255, 0.4)',
    },
    imageContainer: {
        position: 'relative',
        height: '200px',
        width: '100%',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'transform 0.5s ease',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.6))',
    },
    addButton: {
        position: 'absolute',
        bottom: '15px',
        right: '15px',
        backgroundColor: '#ff6b6b',
        color: 'white',
        border: 'none',
        width: '45px',
        height: '45px',
        borderRadius: '50%',
        cursor: 'pointer',
        fontSize: '1.2rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
        zIndex: 10,
    },
    content: {
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '0.5rem',
    },
    title: {
        fontSize: '1.3rem',
        fontWeight: '700',
        color: '#222',
        margin: 0,
        lineHeight: '1.2',
    },
    price: {
        fontSize: '1.2rem',
        fontWeight: '800',
        color: '#ff6b6b',
        backgroundColor: '#fff',
        padding: '0.2rem 0.6rem',
        borderRadius: '10px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    },
    category: {
        color: '#888',
        fontSize: '0.8rem',
        textTransform: 'uppercase',
        letterSpacing: '1.2px',
        fontWeight: '600',
        marginBottom: '0.8rem',
    },
    description: {
        fontSize: '0.95rem',
        color: '#555',
        lineHeight: '1.6',
        flexGrow: 1,
    },
    typeIndicator: (type) => ({
        position: 'absolute',
        top: '15px',
        left: '15px',
        width: '20px',
        height: '20px',
        backgroundColor: 'white',
        border: `2px solid ${type === 'Non-Veg' ? '#e74c3c' : '#2ecc71'}`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '4px',
        padding: '2px',
        zIndex: 10,
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
    }),
    typeDot: (type) => ({
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        backgroundColor: type === 'Non-Veg' ? '#e74c3c' : '#2ecc71',
    }),
    unavailableBadge: {
        position: 'absolute',
        bottom: '15px',
        right: '15px',
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '0.5rem 1rem',
        borderRadius: '50px',
        fontSize: '0.85rem',
        fontWeight: 'bold',
        zIndex: 10,
        backdropFilter: 'blur(4px)',
        border: '1px solid rgba(255,255,255,0.2)'
    }
};

export default FoodCard;
