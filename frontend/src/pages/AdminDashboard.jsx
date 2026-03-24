import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import { 
    FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaFileAlt, 
    FaInfoCircle, FaCheckCircle, FaTimesCircle, FaClock,
    FaArrowRight, FaFilter, FaFileExport, FaDownload,
    FaCreditCard, FaMoneyBillWave, FaExclamationCircle
} from 'react-icons/fa';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [foods, setFoods] = useState([]);
    const [applications, setApplications] = useState([]);
    const [view, setView] = useState('orders'); // 'orders', 'foods', 'applications', 'analytics'
    const [analyticsData, setAnalyticsData] = useState(null);
    const [analyticsDuration, setAnalyticsDuration] = useState(7);
    const [newFood, setNewFood] = useState({
        name: '', category: '', price: '', image: '', description: '', foodType: 'Veg'
    });
    const [editFoodId, setEditFoodId] = useState(null);
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterRestaurant, setFilterRestaurant] = useState('All');
    const [filterOrderStatus, setFilterOrderStatus] = useState('All');
    const [importFile, setImportFile] = useState(null);
    const [selectedFoods, setSelectedFoods] = useState([]);
    const [sortOption, setSortOption] = useState('name-asc');
    
    // Application Rejection State
    const [rejectAppId, setRejectAppId] = useState(null);
    const [rejectReason, setRejectReason] = useState('Documents are unclear or illegible');

    const config = {
        headers: {
            Authorization: `Bearer ${user?.token}`,
        },
    };

    useEffect(() => {
        if (user && user.token && user.role === 'admin') {
            fetchOrders();
            fetchFoods();
            fetchApplications();
        }
    }, [user]);

    useEffect(() => {
        if (user && user.role === 'admin' && view === 'analytics') {
            fetchAnalytics();
        }
    }, [analyticsDuration, view]);

    const fetchAnalytics = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/analytics/admin?days=${analyticsDuration}`, config);
            setAnalyticsData(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders`, config);
            setOrders(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchFoods = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/foods`);
            setFoods(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchApplications = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/applications`, config);
            setApplications(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleApplicationStatus = async (id, status, reason = '') => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/applications/${id}/status`, { status, rejectReason: reason }, config);
            toast.success(`Application marked as ${status}`);
            fetchApplications();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const confirmRejection = () => {
        if (rejectAppId) {
            handleApplicationStatus(rejectAppId, 'Rejected', rejectReason);
            setRejectAppId(null);
            setRejectReason('Documents are unclear or illegible');
        }
    };

    const handleApplicationStatusChange = (appId, newStatus) => {
        if (newStatus === 'Rejected') {
            setRejectAppId(appId);
        } else {
            handleApplicationStatus(appId, newStatus);
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
        if (filterRestaurant !== 'All') {
            processed = processed.filter(food => {
                const rName = food.restaurantId?.name || 'Admin';
                return rName === filterRestaurant;
            });
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

    const handleExportOrders = () => {
        const filteredOrders = orders.filter(o => filterOrderStatus === 'All' || o.status === filterOrderStatus);
        if (filteredOrders.length === 0) {
            toast.warn('No orders to export');
            return;
        }

        const exportData = filteredOrders.map(order => ({
            'Order ID': order._id,
            'Date': new Date(order.createdAt).toLocaleDateString(),
            'Customer Name': order.user?.name || 'N/A',
            'Total Amount (₹)': order.totalPrice.toFixed(2),
            'Status': order.status,
            'Shipping Address': `${order.shippingAddress?.address}, ${order.shippingAddress?.city}, ${order.shippingAddress?.postalCode}`,
            'Phone': order.shippingAddress?.phone || 'N/A',
            'Items Ordered': order.orderItems.map(item => `${item.name} (x${item.qty})`).join(', ')
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Orders");
        XLSX.writeFile(wb, "orders_export.xlsx");
        toast.success('Orders exported successfully');
    };

    const handleExportFoods = () => {
        const processedFoods = getProcessedFoods();
        if (processedFoods.length === 0) {
            toast.warn('No foods to export');
            return;
        }

        const exportData = processedFoods.map(food => ({
            'ID': food._id,
            'Name': food.name,
            'Category': food.category,
            'Price (₹)': food.price,
            'Type': food.foodType || 'Veg',
            'Restaurant': food.restaurantId?.name || 'Admin',
            'Available': food.isAvailable !== false ? 'Yes' : 'No',
            'Image': food.image || '',
            'Description': food.description || ''
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Foods");
        XLSX.writeFile(wb, "foods_export.xlsx");
        toast.success('Foods exported successfully');
    };

    return (
        <div style={styles.pageWrapper}>
            <motion.div
                style={styles.container}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <h1 style={styles.title}>Admin Dashboard</h1>
                <div style={styles.tabs}>
                    <button
                        onClick={() => setView('orders')}
                        style={view === 'orders' ? styles.activeTab : styles.tab}
                    >Orders</button>
                    <button
                        onClick={() => setView('foods')}
                        style={view === 'foods' ? styles.activeTab : styles.tab}
                    >Foods</button>
                    <button
                        onClick={() => setView('applications')}
                        style={view === 'applications' ? styles.activeTab : styles.tab}
                    >Partner Apps</button>
                    <button
                        onClick={() => setView('analytics')}
                        style={view === 'analytics' ? styles.activeTab : styles.tab}
                    >Analytics</button>
                </div>

                <div style={styles.contentArea}>
                    <AnimatePresence mode="wait">
                        {view === 'applications' ? (
                            <motion.div
                                key="applications"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h2 style={{ ...styles.sectionTitle, marginBottom: 0 }}>Partner Applications</h2>
                                </div>
                                <div style={styles.tableWrapper}>
                                    <table style={styles.table}>
                                        <thead style={styles.thead}>
                                            <tr>
                                                <th style={styles.th}>Restaurant</th>
                                                <th style={styles.th}>Owner</th>
                                                <th style={styles.th}>Contact</th>
                                                <th style={styles.th}>Applied On</th>
                                                <th style={styles.th}>Document</th>
                                                <th style={styles.th}>Status</th>
                                                <th style={styles.th}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {applications.map((app) => (
                                                <tr key={app._id} style={styles.tr}>
                                                    <td style={styles.td}>
                                                        <div style={{ fontWeight: '700', color: '#1a1a1a' }}>{app.restaurantName}</div>
                                                    </td>
                                                    <td style={styles.td}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                            <div style={styles.avatar}>{app.ownerName.charAt(0)}</div>
                                                            <span>{app.ownerName}</span>
                                                        </div>
                                                    </td>
                                                    <td style={styles.td}>
                                                        <div style={styles.contactInfo}>
                                                            <div style={styles.contactItem}><FaEnvelope size={12} /> {app.email}</div>
                                                            <div style={styles.contactItem}><FaPhone size={12} /> {app.phone}</div>
                                                        </div>
                                                    </td>
                                                    <td style={styles.td}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#666' }}>
                                                            <FaCalendarAlt size={12} />
                                                            {new Date(app.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </td>
                                                    <td style={styles.td}>
                                                        <a
                                                            href={`https://docs.google.com/viewer?url=${encodeURIComponent(app.documentPath && app.documentPath.startsWith('http') ? app.documentPath : `${import.meta.env.VITE_API_URL}/${app.documentPath}`)}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            style={styles.docLink}
                                                        >
                                                            <FaFileAlt /> View Doc
                                                        </a>
                                                    </td>
                                                    <td style={styles.td}>
                                                        <span style={{
                                                            ...styles.pill,
                                                            backgroundColor: app.status === 'Approved' ? '#e8f5e9' : app.status === 'Rejected' ? '#ffebee' : '#fff8e1',
                                                            color: app.status === 'Approved' ? '#2e7d32' : app.status === 'Rejected' ? '#c62828' : '#f9a825'
                                                        }}>
                                                            {app.status === 'Approved' && <FaCheckCircle size={12} />}
                                                            {app.status === 'Rejected' && <FaTimesCircle size={12} />}
                                                            {app.status === 'Pending' && <FaClock size={12} />}
                                                            {app.status}
                                                        </span>
                                                    </td>
                                                    <td style={styles.td}>
                                                        <select
                                                            value={app.status}
                                                            onChange={(e) => handleApplicationStatusChange(app._id, e.target.value)}
                                                            style={{...styles.select, padding: '0.4rem'}}
                                                        >
                                                            <option value="Pending">Pending</option>
                                                            <option value="Approved">Approved</option>
                                                            <option value="Rejected">Rejected</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        ) : view === 'orders' ? (
                            <motion.div
                                key="orders"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                                    <h2 style={{ ...styles.sectionTitle, marginBottom: 0 }}>Active Orders Overview</h2>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <div style={styles.filterGroup}>
                                            <FaFilter size={14} color="#666" />
                                            <select
                                                value={filterOrderStatus}
                                                onChange={(e) => setFilterOrderStatus(e.target.value)}
                                                style={styles.ghostSelect}
                                            >
                                                <option value="All">All Orders</option>
                                                <option value="Pending">Pending</option>
                                                <option value="Preparing">Preparing</option>
                                                <option value="Delivered">Delivered</option>
                                            </select>
                                        </div>
                                        <button onClick={handleExportOrders} style={styles.premiumBtn}>
                                            <FaFileExport /> Export Orders
                                        </button>
                                    </div>
                                </div>
                                <div style={styles.tableWrapper}>
                                    <table style={styles.table}>
                                        <thead style={styles.thead}>
                                            <tr>
                                                <th style={styles.th}>ID</th>
                                                <th style={styles.th}>Date</th>
                                                <th style={styles.th}>Customer</th>
                                                <th style={styles.th}>Total</th>
                                                <th style={styles.th}>Payment</th>
                                                <th style={styles.th}>Status</th>
                                                <th style={styles.th}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.filter(order => filterOrderStatus === 'All' || order.status === filterOrderStatus).map((order) => (
                                                <tr key={order._id} style={styles.tr}>
                                                    <td style={styles.td}>
                                                        <span style={styles.idBadge}>#{order._id.substring(order._id.length - 6).toUpperCase()}</span>
                                                    </td>
                                                    <td style={styles.td}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#666' }}>
                                                            <FaCalendarAlt size={12} />
                                                            {new Date(order.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </td>
                                                    <td style={styles.td}>
                                                        <div style={{ fontWeight: '600' }}>{order.user?.name || 'Guest'}</div>
                                                    </td>
                                                    <td style={styles.td}>
                                                        <div style={{ fontWeight: '700', color: '#1a1a1a', fontSize: '1rem' }}>₹{order.totalPrice.toFixed(2)}</div>
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
                                                        <span style={{ 
                                                            ...styles.pill, 
                                                            backgroundColor: 
                                                                order.status === 'Delivered' ? '#e8f5e9' : 
                                                                order.status === 'Failed' || order.status === 'Cancelled' ? '#ffebee' : 
                                                                '#fff8e1',
                                                            color: 
                                                                order.status === 'Delivered' ? '#2e7d32' : 
                                                                order.status === 'Failed' || order.status === 'Cancelled' ? '#c62828' : 
                                                                '#f9a825'
                                                        }}>
                                                            {order.status === 'Delivered' && <FaCheckCircle size={12} />}
                                                            {(order.status === 'Failed' || order.status === 'Cancelled') && <FaTimesCircle size={12} />}
                                                            {['Pending', 'Preparing', 'Processing'].includes(order.status) && <FaClock size={12} />}
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td style={styles.td}>
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button
                                                                onClick={() => alert(`Address: ${order.shippingAddress?.address}, ${order.shippingAddress?.city}\nPhone: ${order.shippingAddress?.phone}`)}
                                                                style={styles.iconBtn}
                                                                title="Order Info"
                                                            >
                                                                <FaInfoCircle />
                                                            </button>
                                                            <select
                                                                value={order.status}
                                                                onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                                                style={{...styles.select, padding: '0.3rem'}}
                                                            >
                                                                <option value="Pending">Pending</option>
                                                                <option value="Preparing">Preparing</option>
                                                                <option value="Delivered">Delivered</option>
                                                            </select>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
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
                                    <h2 style={{ ...styles.sectionTitle, marginBottom: 0 }}>Global Sales Analytics</h2>
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
                                        <button onClick={fetchAnalytics} style={styles.viewBtn}>Refresh</button>
                                    </div>
                                </div>
                                <AnalyticsDashboard data={analyticsData} type="admin" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="foods"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <div style={styles.foodsGrid}>
                                    <div style={styles.foodFormSection}>
                                        <h2 style={styles.sectionTitle}>Manage Foods</h2>
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

                                        <label style={{ fontWeight: '600', color: '#555', marginLeft: '1rem' }}>Filter by Restaurant:</label>
                                        <select
                                            value={filterRestaurant}
                                            onChange={(e) => setFilterRestaurant(e.target.value)}
                                            style={styles.select}
                                        >
                                            <option value="All">All Restaurants</option>
                                            {[...new Set(foods.map(item => item.restaurantId?.name || 'Admin'))].map(resName => (
                                                <option key={resName} value={resName}>{resName}</option>
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

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-3.2rem', pointerEvents: 'none' }}>
                                        <button onClick={handleExportFoods} style={{ ...styles.exportBtn, pointerEvents: 'auto' }}>
                                            Export Foods
                                        </button>
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
                                                    <p style={{ color: '#666', opacity: food.isAvailable === false ? 0.5 : 1, margin: '0.2rem 0' }}>₹{food.price.toFixed(2)}</p>
                                                    <span style={{ fontSize: '0.8rem', color: '#888', background: '#f1f3f5', padding: '2px 8px', borderRadius: '10px' }}>
                                                        {food.restaurantId?.name ? `🧑‍🍳 ${food.restaurantId.name}` : `🛡️ Admin`}
                                                    </span>
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
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Rejection Modal Overlay */}
            <AnimatePresence>
                {rejectAppId && (
                    <motion.div
                        style={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            style={styles.modalContent}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <h3 style={styles.modalTitle}>Select Rejection Reason</h3>
                            <p style={styles.modalSubtitle}>This reason will be securely emailed to the partner.</p>
                            
                            <select 
                                value={rejectReason} 
                                onChange={(e) => setRejectReason(e.target.value)} 
                                style={{...styles.select, width: '100%', marginBottom: '1rem', padding: '0.8rem'}}
                            >
                                <option value="Documents are unclear or illegible">Documents are unclear or illegible</option>
                                <option value="FSSAI Certificate is missing or invalid">FSSAI Certificate is missing or invalid</option>
                                <option value="Provided Menu is missing pricing or details">Provided Menu is missing pricing or details</option>
                                <option value="Restaurant address could not be verified">Restaurant address could not be verified</option>
                                <option value="We are not currently onboarding restaurants in your area">Not currently onboarding in your area</option>
                                <option value="Application violates our core safety policies">Application violates core policies</option>
                            </select>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button onClick={confirmRejection} style={{...styles.addButton, backgroundColor: '#dc3545', flex: 1}}>
                                    Confirm Rejection
                                </button>
                                <button onClick={() => setRejectAppId(null)} style={{...styles.cancelButton, flex: 1}}>
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
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
    tabs: { marginBottom: '2rem', display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' },
    tab: { padding: '0.7rem 1.5rem', border: 'none', background: 'rgba(0,0,0,0.05)', borderRadius: '30px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', transition: 'all 0.3s' },
    activeTab: { padding: '0.7rem 1.5rem', border: 'none', background: '#333', color: 'white', borderRadius: '30px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' },
    contentArea: { background: 'white', padding: '1.5rem', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' },
    sectionTitle: { marginBottom: '1.2rem', color: '#444', fontSize: '1.4rem' },
    tableWrapper: { overflowX: 'auto', marginBottom: '1rem', borderRadius: '8px', border: '1px solid #eee' },
    table: { width: '100%', borderCollapse: 'collapse', minWidth: '800px' },
    badge: { padding: '0.3rem 0.6rem', borderRadius: '12px', color: 'white', fontSize: '0.75rem', fontWeight: 'bold' },
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
    avatar: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #6e8efb 0%, #a777e3 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '0.8rem'
    },
    contactInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.2rem'
    },
    contactItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        fontSize: '0.8rem',
        color: '#666'
    },
    docLink: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        color: '#3392fd',
        fontWeight: '700',
        fontSize: '0.85rem',
        textDecoration: 'none',
        '&:hover': { textDecoration: 'underline' }
    },
    filterGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: '#f8f9fa',
        padding: '0.4rem 1rem',
        borderRadius: '10px',
        border: '1px solid #eee'
    },
    ghostSelect: {
        background: 'transparent',
        border: 'none',
        outline: 'none',
        fontSize: '0.9rem',
        fontWeight: '600',
        cursor: 'pointer',
        color: '#444'
    },
    premiumBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        padding: '0.6rem 1.2rem',
        background: '#1a1a1a',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        fontSize: '0.85rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 15px rgba(0,0,0,0.2)' }
    },
    iconBtn: {
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        border: '1px solid #eee',
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: '#666',
        transition: 'all 0.2s',
        '&:hover': { background: '#f8f9fa', color: '#1a1a1a' }
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
    thead: {
        background: '#fdfdfd'
    },
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

    exportBtn: { background: '#28a745', color: 'white', border: 'none', padding: '0.6rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    deleteSelectedBtn: { background: '#dc3545', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' },

    actionButtons: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
    hideBtn: { background: '#6c757d', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
    showBtn: { background: '#28a745', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
    editBtn: { background: '#ffc107', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
    deleteBtn: { background: '#dc3545', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
    buttonGroup: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
    updateButton: { padding: '0.8rem 1.5rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', flex: 1 },
    cancelButton: { padding: '0.8rem 1.5rem', background: '#6c757d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', flex: 1 },
    viewBtn: { padding: '0.4rem 0.8rem', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' },

    foodsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' },
    foodFormSection: { minWidth: 0 },
    importSection: { background: '#f8f9fa', padding: '1.5rem', borderRadius: '12px', height: 'fit-content' },
    importBox: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    importForm: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    fileInputWrapper: { border: '2px dashed #ddd', padding: '1.2rem', borderRadius: '8px', textAlign: 'center', background: 'white' },
    fileInput: { width: '100%', cursor: 'pointer', fontSize: '0.9rem' },
    importButton: { padding: '0.8rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem' },
    importInstructions: { fontSize: '0.8rem', color: '#666', background: '#fff9e6', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ffeeba' },

    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '1rem' },
    modalContent: { background: 'white', padding: '2rem', borderRadius: '15px', width: '100%', maxWidth: '450px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' },
    modalTitle: { margin: '0 0 0.5rem 0', color: '#333', fontSize: '1.3rem' },
    modalSubtitle: { margin: '0 0 1.5rem 0', color: '#666', fontSize: '0.85rem' }
};

export default AdminDashboard;
