




































import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import { 
    FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaFileAlt, 
    FaInfoCircle, FaCheckCircle, FaTimesCircle, FaClock,
    FaCreditCard, FaMoneyBillWave, FaMapMarkerAlt, FaFilter,
    FaBoxOpen, FaMotorcycle, FaUtensils
} from 'react-icons/fa';

const RestaurantDashboard = () => {
    const { user } = useContext(AuthContext);
    const [foods, setFoods] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [errorOrders, setErrorOrders] = useState('');
    const [view, setView] = useState('foods'); // 'foods', 'orders', 'analytics'
    const [analyticsData, setAnalyticsData] = useState(null);
    const [analyticsDuration, setAnalyticsDuration] = useState(7);
    const [newFood, setNewFood] = useState({
        name: '', category: '', price: '', image: '', description: '', foodType: 'Veg'
    });
    const [editFoodId, setEditFoodId] = useState(null);
    const [filterCategory, setFilterCategory] = useState('All');
    const [selectedFoods, setSelectedFoods] = useState([]);
    const [sortOption, setSortOption] = useState('name-asc');
    const [importFile, setImportFile] = useState(null);

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

    useEffect(() => {
        if (user && user.role === 'restaurant' && view === 'analytics') {
            fetchAnalytics();
        }
    }, [analyticsDuration, view]);

    const fetchAnalytics = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/analytics/restaurant?days=${analyticsDuration}`, config);
            setAnalyticsData(data);
        } catch (error) {
            console.error(error);
        }
    };

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

    const handleImport = async (e) => {
        e.preventDefault();
        if (!importFile) {
            toast.error('Please select a file');
            return;
        }

        const formData = new FormData();
        formData.append('file', importFile);

        try {
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/foods/import`, formData, {
                headers: {
                    ...config.headers,
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success(data.message);
            setImportFile(null);
            e.target.reset();
            fetchFoods();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Import failed');
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
                    <button
                        onClick={() => setView('analytics')}
                        style={view === 'analytics' ? styles.activeTab : styles.tab}
                    >Analytics</button>
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

                                    <div style={styles.importSection}>
                                        <h3 style={{ marginBottom: '1rem', color: '#555' }}>Bulk Food Import</h3>
                                        <div style={styles.importBox}>
                                            <form onSubmit={handleImport} style={styles.importForm}>
                                                <div style={styles.fileInputWrapper}>
                                                    <input
                                                        type="file"
                                                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                                        onChange={(e) => setImportFile(e.target.files[0])}
                                                        style={styles.fileInput}
                                                    />
                                                </div>
                                                <button type="submit" style={styles.importButton}>Import Foods</button>
                                            </form>
                                            <div style={styles.importInstructions}>
                                                <p>Supported formats: <strong>.csv, .xlsx</strong></p>
                                                <p>Required columns: <strong>name, category, price</strong></p>
                                                <p>Optional: <strong>foodType (Veg/Non-Veg), image, description</strong></p>
                                            </div>
                                        </div>
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
                        ) : view === 'analytics' ? (
                            <motion.div
                                key="analytics"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                                    <h2 style={{ ...styles.sectionTitle, marginBottom: 0 }}>Store Performance Analytics</h2>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <select 
                                            value={analyticsDuration} 
                                            onChange={(e) => setAnalyticsDuration(Number(e.target.value))}
                                            style={styles.select}
                                        >
                                            <option value={7}>Last 7 Days</option>
                                            <option value={30}>Last 30 Days</option>
                                            <option value={90}>Last 90 Days</option>
                                        </select>
                                        <button onClick={fetchAnalytics} style={styles.tab}>Refresh</button>
                                    </div>
                                </div>
                                <AnalyticsDashboard data={analyticsData} type="restaurant" />
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
                                        <thead style={styles.thead}>
                                            <tr>
                                                <th style={styles.th}>Order ID</th>
                                                <th style={styles.th}>Customer</th>
                                                <th style={styles.th}>Items</th>
                                                <th style={styles.th}>Delivery Address</th>
                                                <th style={styles.th}>Total</th>
                                                <th style={styles.th}>Payment</th>
                                                <th style={styles.th}>Date</th>
                                                <th style={styles.th}>Status</th>
                                                <th style={styles.th}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loadingOrders ? (
                                                <tr><td colSpan="9" style={styles.td}>Loading orders...</td></tr>
                                            ) : errorOrders ? (
                                                <tr><td colSpan="9" style={styles.td}>{errorOrders}</td></tr>
                                            ) : orders.length === 0 ? (
                                                <tr><td colSpan="9" style={styles.td}>No orders found.</td></tr>
                                            ) : (
                                                orders.map((order) => (
                                                    <tr key={order._id} style={styles.tr}>
                                                        <td style={styles.td}>
                                                            <span style={styles.idBadge}>#{order._id.substring(order._id.length - 6).toUpperCase()}</span>
                                                        </td>
                                                        <td style={styles.td}>
                                                            <div style={{ fontWeight: '600', color: '#1a1a1a' }}>{order.user?.name || 'Unknown'}</div>
                                                            {order.shippingAddress && (
                                                                <div style={styles.contactItem}>
                                                                    <FaPhone size={10} /> {order.shippingAddress.phone}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td style={styles.td}>
                                                            <div style={styles.itemList}>
                                                                {order.orderItems.map((item, idx) => (
                                                                    <div key={idx} style={styles.itemRow}>
                                                                        <span style={styles.itemQty}>{item.qty}x</span> {item.name}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td style={styles.td}>
                                                            {order.shippingAddress ? (
                                                                <div style={styles.addressBox}>
                                                                    <FaMapMarkerAlt size={12} style={{ marginTop: '2px' }} />
                                                                    <span>{order.shippingAddress.address}, {order.shippingAddress.city}</span>
                                                                </div>
                                                            ) : <span style={{ color: '#999' }}>N/A</span>}
                                                        </td>
                                                        <td style={styles.td}>
                                                            <div style={{ fontWeight: '700', color: '#1a1a1a' }}>₹{order.totalPrice.toFixed(2)}</div>
                                                        </td>
                                                        <td style={styles.td}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                                <div style={{ 
                                                                    padding: '0.4rem', 
                                                                    borderRadius: '8px', 
                                                                    background: order.paymentMethod === 'Cash on Delivery' ? '#e8f5e9' : '#e3f2fd',
                                                                    color: order.paymentMethod === 'Cash on Delivery' ? '#2e7d32' : '#1565c0'
                                                                }}>
                                                                    {order.paymentMethod === 'Cash on Delivery' ? <FaMoneyBillWave size={14} /> : <FaCreditCard size={14} />}
                                                                </div>
                                                                <div style={{ fontSize: '0.85rem' }}>
                                                                    <div style={{ fontWeight: '600' }}>{order.paymentMethod}</div>
                                                                    <span style={{ 
                                                                        fontSize: '0.75rem', 
                                                                        color: order.isPaid ? '#2e7d32' : '#c62828',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '0.2rem'
                                                                    }}>
                                                                        {order.isPaid ? <FaCheckCircle size={10} /> : <FaClock size={10} />}
                                                                        {order.isPaid ? 'Paid' : 'Unpaid'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td style={styles.td}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#666', fontSize: '0.85rem' }}>
                                                                <FaCalendarAlt size={12} />
                                                                {new Date(order.createdAt).toLocaleDateString()}
                                                            </div>
                                                        </td>
                                                        <td style={styles.td}>
                                                            <span style={{
                                                                ...styles.pill,
                                                                backgroundColor: 
                                                                    order.status === 'Delivered' ? '#e8f5e9' : 
                                                                    order.status === 'Cancelled' || order.status === 'Rejected' ? '#ffebee' : 
                                                                    '#fff8e1',
                                                                color: 
                                                                    order.status === 'Delivered' ? '#2e7d32' : 
                                                                    order.status === 'Cancelled' || order.status === 'Rejected' ? '#c62828' : 
                                                                    '#f9a825'
                                                            }}>
                                                                {order.status === 'Delivered' && <FaCheckCircle size={12} />}
                                                                {order.status === 'Preparing' && <FaUtensils size={12} />}
                                                                {order.status === 'Out for Delivery' && <FaMotorcycle size={12} />}
                                                                {order.status === 'Processing' && <FaBoxOpen size={12} />}
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                        <td style={styles.td}>
                                                            <select
                                                                value={order.status}
                                                                onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                                                style={{...styles.select, padding: '0.3rem'}}
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
        padding: '2rem 3%',
        minHeight: '80vh',
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '2rem 1.5rem',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    },
    title: { fontSize: '2rem', marginBottom: '1.5rem', color: '#333', textAlign: 'center', fontWeight: '800' },
    contentArea: { background: 'white', padding: '1.5rem', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' },
    sectionTitle: { marginBottom: '1.2rem', color: '#444', fontSize: '1.4rem' },
    tabs: { display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '2px solid #eee', paddingBottom: '0.5rem', flexWrap: 'wrap' },
    tab: { background: 'none', border: 'none', fontSize: '1rem', fontWeight: 'bold', color: '#666', cursor: 'pointer', padding: '0.5rem 1rem', transition: 'color 0.3s' },
    activeTab: { background: 'none', border: 'none', fontSize: '1rem', fontWeight: 'bold', color: '#ff6b6b', cursor: 'pointer', padding: '0.5rem 1rem' },
    tableWrapper: { overflowX: 'auto', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #eee', marginBottom: '1rem' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' },
    tableHeader: { padding: '1rem', borderBottom: '2px solid #eee', color: '#555', backgroundColor: '#f9f9f9', fontSize: '0.9rem', fontWeight: '700' },
    tableCell: { padding: '1rem', borderBottom: '1px solid #eee', verticalAlign: 'middle', fontSize: '0.9rem' },
    thead: { background: '#f8f9fa' },
    th: {
        padding: '1.2rem 1rem',
        textAlign: 'left',
        fontSize: '0.85rem',
        fontWeight: '700',
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        borderBottom: '2px solid #f1f3f5'
    },
    tr: {
        transition: 'background 0.2s',
        '&:hover': { background: '#fafafa' }
    },
    td: {
        padding: '1.2rem 1rem',
        borderBottom: '1px solid #f1f3f5',
        verticalAlign: 'middle'
    },
    idBadge: {
        background: '#f1f3f5',
        color: '#495057',
        padding: '0.2rem 0.5rem',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: '700',
        fontFamily: 'monospace'
    },
    pill: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.4rem 0.8rem',
        borderRadius: '50px',
        fontSize: '0.75rem',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    contactItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        fontSize: '0.8rem',
        color: '#666',
        marginTop: '0.2rem'
    },
    itemList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.2rem'
    },
    itemRow: {
        fontSize: '0.85rem',
        color: '#444'
    },
    itemQty: {
        fontWeight: 'bold',
        color: '#ff6b6b'
    },
    addressBox: {
        display: 'flex',
        gap: '0.5rem',
        fontSize: '0.85rem',
        color: '#666',
        maxWidth: '200px',
        lineHeight: '1.4'
    },
    badge: { padding: '0.3rem 0.6rem', borderRadius: '50px', color: 'white', fontSize: '0.75rem', fontWeight: 'bold', display: 'inline-block' },
    select: { padding: '0.5rem', borderRadius: '8px', border: '1px solid #ddd', cursor: 'pointer', fontSize: '0.9rem' },
    form: { display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', background: '#f8f9fa', padding: '1.5rem', borderRadius: '12px' },
    formGroup: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
    input: { flex: 1, minWidth: '200px', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem' },
    textarea: { padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem', minHeight: '80px' },
    addButton: { padding: '0.8rem 1.5rem', background: '#28a745', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', transition: 'background 0.3s' },
    foodList: { display: 'flex', flexDirection: 'column', gap: '0.8rem' },
    foodItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #eee', borderRadius: '12px', background: 'white', flexWrap: 'wrap', gap: '1rem' },
    foodInfo: { display: 'flex', alignItems: 'center', gap: '1rem' },
    foodThumb: { width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' },
    deleteSelectedBtn: { background: '#dc3545', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' },
    actionButtons: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
    hideBtn: { background: '#6c757d', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
    showBtn: { background: '#28a745', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
    editBtn: { background: '#ffc107', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
    deleteBtn: { background: '#dc3545', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
    buttonGroup: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
    updateButton: { padding: '0.8rem 2rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', flex: 1 },
    cancelButton: { padding: '0.8rem 2rem', background: '#6c757d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', flex: 1 },
    foodsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' },
    foodFormSection: { minWidth: 0 },
    importSection: { background: '#f8f9fa', padding: '1.5rem', borderRadius: '12px', height: 'fit-content' },
    importBox: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    importForm: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    fileInputWrapper: { border: '2px dashed #ddd', padding: '1.2rem', borderRadius: '8px', textAlign: 'center', background: 'white' },
    fileInput: { width: '100%', cursor: 'pointer', fontSize: '0.9rem' },
    importButton: { padding: '0.8rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem' },
    importInstructions: { fontSize: '0.8rem', color: '#666', background: '#fff9e6', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ffeeba' }
};

export default RestaurantDashboard;
