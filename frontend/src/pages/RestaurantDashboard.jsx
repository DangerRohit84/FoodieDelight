import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const RestaurantDashboard = () => {
    const { user } = useContext(AuthContext);
    const [foods, setFoods] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [errorOrders, setErrorOrders] = useState('');
    const [view, setView] = useState('foods'); // 'foods', 'orders'
    const [newFood, setNewFood] = useState({
        name: '', category: '', price: '', image: '', description: '', foodType: 'Veg'
    });
    const [editFoodId, setEditFoodId] = useState(null);
    const [filterCategory, setFilterCategory] = useState('All');
    const [selectedFoods, setSelectedFoods] = useState([]);
    const [sortOption, setSortOption] = useState('name-asc');

    const config = {
        headers: {
            Authorization: `Bearer ${user?.token}`,
        },
    };

    useEffect(() => {
        if (user && user.token && user.role === 'restaurant') {
            fetchFoods();
            fetchOrders();
        }
    }, [user]);

    const fetchFoods = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/foods/myfoods`, config);
            setFoods(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchOrders = async () => {
        setLoadingOrders(true);
        setErrorOrders('');
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders/restaurant`, config);
            setOrders(data);
        } catch (error) {
            console.error(error);
            setErrorOrders('Failed to load orders.');
        } finally {
            setLoadingOrders(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/orders/${id}/status`, { status }, config);
            toast.success('Order status updated');
            fetchOrders();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleToggleAvailability = async (id) => {
        try {
            const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/api/foods/${id}/availability`, {}, config);
            toast.success(data.message);
            fetchFoods();
        } catch (error) {
            toast.error('Failed to toggle availability');
        }
    };

    const handleFoodSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editFoodId) {
                await axios.put(`${import.meta.env.VITE_API_URL}/api/foods/${editFoodId}`, newFood, config);
                toast.success('Food updated successfully');
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/api/foods`, newFood, config);
                toast.success('Food added successfully');
            }
            setNewFood({ name: '', category: '', price: '', image: '', description: '', foodType: 'Veg' });
            setEditFoodId(null);
            fetchFoods();
        } catch (error) {
            toast.error(editFoodId ? 'Failed to update food' : 'Failed to add food');
        }
    };

    const handleEditClick = (food) => {
        setEditFoodId(food._id);
        setNewFood({
            name: food.name,
            category: food.category,
            price: food.price,
            image: food.image,
            description: food.description,
            foodType: food.foodType || 'Veg'
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditFoodId(null);
        setNewFood({ name: '', category: '', price: '', image: '', description: '', foodType: 'Veg' });
    };

    const getProcessedFoods = () => {
        let processed = [...foods];
        if (filterCategory !== 'All') {
            processed = processed.filter(food => food.category === filterCategory);
        }

        switch (sortOption) {
            case 'price-asc': return processed.sort((a, b) => a.price - b.price);
            case 'price-desc': return processed.sort((a, b) => b.price - a.price);
            case 'name-desc': return processed.sort((a, b) => b.name.localeCompare(a.name));
            case 'name-asc':
            default: return processed.sort((a, b) => a.name.localeCompare(b.name));
        }
    };

    const toggleFoodSelection = (id) => {
        setSelectedFoods(prev =>
            prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        const processed = getProcessedFoods();
        if (selectedFoods.length === processed.length && processed.length > 0) {
            setSelectedFoods([]);
        } else {
            setSelectedFoods(processed.map(f => f._id));
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedFoods.length === 0) return;
        if (!user || !user.token) {
            toast.error('Session expired or corrupted. Please login again.');
            return;
        }
        if (window.confirm(`Are you sure you want to delete ${selectedFoods.length} selected foods?`)) {
            try {
                await Promise.all(selectedFoods.map(id =>
                    axios.delete(`${import.meta.env.VITE_API_URL}/api/foods/${id}`, config)
                ));
                toast.success('Selected foods deleted');
                setSelectedFoods([]);
                fetchFoods();
            } catch (error) {
                toast.error('Failed to delete some foods');
            }
        }
    };

    const handleDeleteFood = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL}/api/foods/${id}`, config);
                toast.success('Food deleted');
                fetchFoods();
            } catch (error) {
                toast.error('Failed to delete food');
            }
        }
    };

    return (
        <div style={styles.pageWrapper}>
            <motion.div
                style={styles.container}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <h1 style={styles.title}>Restaurant Dashboard</h1>

                <div style={styles.tabs}>
                    <button
                        onClick={() => setView('foods')}
                        style={view === 'foods' ? styles.activeTab : styles.tab}
                    >My Foods</button>
                    <button
                        onClick={() => setView('orders')}
                        style={view === 'orders' ? styles.activeTab : styles.tab}
                    >Customer Orders</button>
                </div>

                <div style={styles.contentArea}>
                    <AnimatePresence mode="wait">
                        {view === 'foods' ? (
                            <motion.div
                                key="foods"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <div style={styles.foodsGrid}>
                                    <div style={styles.foodFormSection}>
                                        <h2 style={styles.sectionTitle}>Manage My Foods</h2>
                                        <form onSubmit={handleFoodSubmit} style={styles.form}>
                                            <h3 style={{ marginBottom: '1rem', color: '#555' }}>{editFoodId ? 'Edit Food' : 'Add New Food'}</h3>
                                            <div style={styles.formGroup}>
                                                <input placeholder="Name" value={newFood.name} onChange={(e) => setNewFood({ ...newFood, name: e.target.value })} style={styles.input} required />
                                                <input placeholder="Category" value={newFood.category} onChange={(e) => setNewFood({ ...newFood, category: e.target.value })} style={styles.input} required />
                                            </div>
                                            <div style={styles.formGroup}>
                                                <input type="number" placeholder="Price" value={newFood.price} onChange={(e) => setNewFood({ ...newFood, price: e.target.value })} style={styles.input} required />
                                                <select value={newFood.foodType} onChange={(e) => setNewFood({ ...newFood, foodType: e.target.value })} style={styles.input}>
                                                    <option value="Veg">Veg</option>
                                                    <option value="Non-Veg">Non-Veg</option>
                                                </select>
                                            </div>
                                            <input placeholder="Image URL" value={newFood.image} onChange={(e) => setNewFood({ ...newFood, image: e.target.value })} style={{ ...styles.input, width: '100%', marginBottom: '1rem' }} required />
                                            <textarea placeholder="Description" value={newFood.description} onChange={(e) => setNewFood({ ...newFood, description: e.target.value })} style={styles.textarea} />
                                            <div style={styles.buttonGroup}>
                                                <button type="submit" style={editFoodId ? styles.updateButton : styles.addButton}>
                                                    {editFoodId ? 'Update Food' : 'Add Food'}
                                                </button>
                                                {editFoodId && (
                                                    <button type="button" onClick={handleCancelEdit} style={styles.cancelButton}>
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </form>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                        <label style={{ fontWeight: '600', color: '#555' }}>Filter by Category:</label>
                                        <select
                                            value={filterCategory}
                                            onChange={(e) => setFilterCategory(e.target.value)}
                                            style={styles.select}
                                        >
                                            <option value="All">All Categories</option>
                                            {[...new Set(foods.map(item => item.category))].map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>

                                        <label style={{ fontWeight: '600', color: '#555', marginLeft: '1rem' }}>Sort by:</label>
                                        <select
                                            value={sortOption}
                                            onChange={(e) => setSortOption(e.target.value)}
                                            style={styles.select}
                                        >
                                            <option value="name-asc">Name (A-Z)</option>
                                            <option value="name-desc">Name (Z-A)</option>
                                            <option value="price-asc">Price (Low to High)</option>
                                            <option value="price-desc">Price (High to Low)</option>
                                        </select>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8f9fa', padding: '0.8rem', borderRadius: '8px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 'bold', color: '#444' }}>
                                            <input
                                                type="checkbox"
                                                onChange={toggleSelectAll}
                                                checked={getProcessedFoods().length > 0 && selectedFoods.length === getProcessedFoods().length}
                                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                            Select All ({selectedFoods.length} selected)
                                        </label>

                                        {selectedFoods.length > 0 && (
                                            <button onClick={handleDeleteSelected} style={styles.deleteSelectedBtn}>
                                                Delete Selected
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div style={styles.foodList}>
                                    {getProcessedFoods().map((food) => (
                                        <div key={food._id} style={{ ...styles.foodItem, border: selectedFoods.includes(food._id) ? '2px solid #ff6b6b' : '1px solid #eee' }}>
                                            <div style={styles.foodInfo}>
                                                <div style={{ display: 'flex', alignItems: 'center', paddingRight: '0.5rem' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedFoods.includes(food._id)}
                                                        onChange={() => toggleFoodSelection(food._id)}
                                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                                    />
                                                </div>
                                                <img src={food.image} alt={food.name} style={styles.foodThumb} />
                                                <div>
                                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: food.isAvailable === false ? 0.5 : 1 }}>
                                                        {food.name}
                                                        {food.foodType === 'Veg' ?
                                                            <span style={{ color: 'green', fontSize: '10px', marginLeft: '0.5rem' }}>🟢 Veg</span> :
                                                            <span style={{ color: 'red', fontSize: '10px', marginLeft: '0.5rem' }}>🔴 Non-Veg</span>}
                                                        {food.isAvailable === false && <span style={{ color: '#dc3545', fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid #dc3545', padding: '2px 6px', borderRadius: '4px' }}>Hidden</span>}
                                                    </h4>
                                                    <p style={{ color: '#666', opacity: food.isAvailable === false ? 0.5 : 1 }}>₹{food.price.toFixed(2)}</p>
                                                </div>
                                            </div>
                                            <div style={styles.actionButtons}>
                                                <button onClick={() => handleToggleAvailability(food._id)} style={food.isAvailable !== false ? styles.hideBtn : styles.showBtn}>
                                                    {food.isAvailable !== false ? 'Mark Unavailable' : 'Mark Available'}
                                                </button>
                                                <button onClick={() => handleEditClick(food)} style={styles.editBtn}>Edit</button>
                                                <button onClick={() => handleDeleteFood(food._id)} style={styles.deleteBtn}>Delete</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="orders"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h2 style={{ ...styles.sectionTitle, marginBottom: 0 }}>Customer Orders</h2>
                                </div>
                                <div style={styles.tableWrapper}>
                                    <table style={styles.table}>
                                        <thead>
                                            <tr>
                                                <th style={styles.tableHeader}>Order ID</th>
                                                <th style={styles.tableHeader}>Customer</th>
                                                <th style={styles.tableHeader}>Items</th>
                                                <th style={styles.tableHeader}>Total</th>
                                                <th style={styles.tableHeader}>Date</th>
                                                <th style={styles.tableHeader}>Status</th>
                                                <th style={styles.tableHeader}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loadingOrders ? (
                                                <tr><td colSpan="7" style={styles.tableCell}>Loading orders...</td></tr>
                                            ) : errorOrders ? (
                                                <tr><td colSpan="7" style={styles.tableCell}>{errorOrders}</td></tr>
                                            ) : orders.length === 0 ? (
                                                <tr><td colSpan="7" style={styles.tableCell}>No orders found.</td></tr>
                                            ) : (
                                                orders.map((order) => (
                                                    <tr key={order._id}>
                                                        <td style={styles.tableCell}>{order._id.substring(0, 8)}...</td>
                                                        <td style={styles.tableCell}>
                                                            {order.user?.name || 'Unknown'}<br />
                                                            {order.shippingAddress && (
                                                                <span style={{ fontSize: '0.85rem', color: '#666' }}>
                                                                    {order.shippingAddress.phone}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td style={styles.tableCell}>
                                                            <ul style={{ paddingLeft: '20px', margin: 0 }}>
                                                                {order.orderItems.map((item, idx) => (
                                                                    <li key={idx} style={{ fontSize: '0.9rem' }}>
                                                                        {item.qty}x {item.name}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </td>
                                                        <td style={styles.tableCell}>₹{order.totalPrice.toFixed(2)}</td>
                                                        <td style={styles.tableCell}>{new Date(order.createdAt).toLocaleDateString()}</td>
                                                        <td style={styles.tableCell}>
                                                            <span style={{
                                                                ...styles.badge,
                                                                backgroundColor: order.status === 'Delivered' ? '#28a745' : order.status === 'Cancelled' ? '#dc3545' : '#ffc107'
                                                            }}>
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                        <td style={styles.tableCell}>
                                                            <select
                                                                value={order.status}
                                                                onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                                                style={styles.select}
                                                            >
                                                                <option value="Processing">Processing</option>
                                                                <option value="Preparing">Preparing</option>
                                                                <option value="Out for Delivery">Out for Delivery</option>
                                                                <option value="Delivered">Delivered</option>
                                                                <option value="Rejected">Reject Order</option>
                                                                <option value="Cancelled">Cancelled</option>
                                                            </select>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

const styles = {
    pageWrapper: {
        padding: '3rem 5%',
        minHeight: '80vh',
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    },
    title: { fontSize: '2.5rem', marginBottom: '2rem', color: '#333', textAlign: 'center' },
    contentArea: { background: 'white', padding: '2rem', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' },
    sectionTitle: { marginBottom: '1.5rem', color: '#444' },
    tabs: { display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #eee', paddingBottom: '0.5rem' },
    tab: { background: 'none', border: 'none', fontSize: '1.1rem', fontWeight: 'bold', color: '#666', cursor: 'pointer', padding: '0.5rem 1rem', transition: 'color 0.3s' },
    activeTab: { background: 'none', border: 'none', fontSize: '1.1rem', fontWeight: 'bold', color: '#ff6b6b', cursor: 'pointer', padding: '0.5rem 1rem', borderBottom: '3px solid #ff6b6b' },
    tableWrapper: { overflowX: 'auto', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #eee' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    tableHeader: { padding: '1rem', borderBottom: '2px solid #eee', color: '#555', backgroundColor: '#f9f9f9' },
    tableCell: { padding: '1rem', borderBottom: '1px solid #eee', verticalAlign: 'middle' },
    badge: { padding: '0.4rem 0.8rem', borderRadius: '50px', color: 'white', fontSize: '0.85rem', fontWeight: 'bold', display: 'inline-block' },
    select: { padding: '0.5rem', borderRadius: '8px', borderColor: '#ddd', cursor: 'pointer' },
    form: { display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', background: '#f8f9fa', padding: '1.5rem', borderRadius: '12px' },
    formGroup: { display: 'flex', gap: '1rem' },
    input: { flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' },
    textarea: { padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', minHeight: '80px' },
    addButton: { padding: '1rem', background: '#28a745', colour: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', transition: 'background 0.3s' },
    foodList: { display: 'flex', flexDirection: 'column', gap: '0.8rem' },
    foodItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #eee', borderRadius: '12px', background: 'white', transition: 'transform 0.2s' },
    foodInfo: { display: 'flex', alignItems: 'center', gap: '1rem' },
    foodThumb: { width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' },
    deleteSelectedBtn: { background: '#dc3545', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.3s' },
    actionButtons: { display: 'flex', gap: '0.5rem' },
    hideBtn: { background: '#6c757d', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.3s' },
    showBtn: { background: '#28a745', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.3s' },
    editBtn: { background: '#ffc107', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.3s' },
    deleteBtn: { background: '#dc3545', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.3s' },
    buttonGroup: { display: 'flex', gap: '1rem' },
    updateButton: { padding: '1rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', transition: 'background 0.3s', flex: 1 },
    cancelButton: { padding: '1rem', background: '#6c757d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', transition: 'background 0.3s', flex: 1 },
    foodsGrid: { display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginBottom: '2rem' },
    foodFormSection: { minWidth: 0 },
};

export default RestaurantDashboard;
