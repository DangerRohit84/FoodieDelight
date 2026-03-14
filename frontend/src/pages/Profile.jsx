import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaUser, FaHome, FaBriefcase, FaMapMarkerAlt, FaTrash,
    FaPlus, FaChevronRight, FaSignOutAlt, FaIdCard, FaPhoneAlt, FaEnvelope
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'addresses'
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        gender: 'Not Specified',
        phone: '',
        oldPassword: '',
        password: '',
        confirmPassword: ''
    });
    const [addresses, setAddresses] = useState([]);
    const [isEditing, setIsEditing] = useState({
        personal: false,
        email: false,
        phone: false
    });
    const [newAddress, setNewAddress] = useState({
        label: 'HOME',
        address: '',
        city: '',
        postalCode: '',
        country: '',
        phone: ''
    });
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);

    const config = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`,
        },
    };

    useEffect(() => {
        if (user && user.token) {
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`, config);
            setProfileData({
                ...profileData,
                name: data.name,
                email: data.email,
                gender: data.gender || 'Not Specified',
                phone: data.phone || ''
            });
            setAddresses(data.addresses);
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const updateHandler = async (field) => {
        try {
            if (field === 'password') {
                if (profileData.password !== profileData.confirmPassword) {
                    toast.error('New passwords do not match');
                    return;
                }
                if (!profileData.oldPassword || !profileData.password) {
                    toast.error('Both current and new passwords are required');
                    return;
                }
            }

            const payload = field === 'password' 
                ? { oldPassword: profileData.oldPassword, password: profileData.password } 
                : profileData;

            const { data } = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/users/profile`,
                payload,
                config
            );
            toast.success(field === 'password' ? 'Password updated successfully' : 'Information updated');
            
            if (field === 'password') {
                setProfileData({ ...profileData, oldPassword: '', password: '', confirmPassword: '' });
                setIsEditing({ ...isEditing, password: false });
            } else {
                setIsEditing({ ...isEditing, [field]: false });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        }
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAddressId) {
                const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/api/users/address/${editingAddressId}`, newAddress, config);
                setAddresses(data);
                toast.success('Address updated');
            } else {
                const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/address`, newAddress, config);
                setAddresses(data);
                toast.success('Address added');
            }
            setNewAddress({ label: 'HOME', address: '', city: '', postalCode: '', country: '', phone: '' });
            setShowAddressForm(false);
            setEditingAddressId(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        }
    };

    const deleteAddressHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this address?')) {
            try {
                const { data } = await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/address/${id}`, config);
                setAddresses(data.addresses);
                toast.success('Address deleted');
            } catch (error) {
                toast.error('Failed to delete address');
            }
        }
    };

    const editAddressHandler = (addr) => {
        setNewAddress({
            label: addr.label,
            address: addr.address,
            city: addr.city,
            postalCode: addr.postalCode,
            country: addr.country,
            phone: addr.phone
        });
        setEditingAddressId(addr._id);
        setShowAddressForm(true);
    };

    const deactivateHandler = async () => {
        if (window.confirm('Are you sure you want to deactivate your account?')) {
            try {
                await axios.put(`${import.meta.env.VITE_API_URL}/api/users/deactivate`, {}, config);
                toast.success('Account deactivated');
                logout();
                navigate('/');
            } catch (error) {
                toast.error('Deactivation failed');
            }
        }
    };

    const deleteAccountHandler = async () => {
        if (window.confirm('WARNING: Are you sure you want to DELETE your account? This cannot be undone.')) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/profile`, config);
                toast.success('Account deleted');
                logout();
                navigate('/');
            } catch (error) {
                toast.error('Deletion failed');
            }
        }
    };

    return (
        <div style={styles.pageWrapper} className="profile-page">
            <div style={styles.layout} className="profile-layout">
                {/* Sidebar */}
                <aside style={styles.sidebar} className="profile-sidebar">
                    <div style={styles.userHead}>
                        <div style={styles.avatarLarge}>
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div style={styles.userHeadText}>
                            <p style={styles.greeting}>Hello,</p>
                            <h3 style={styles.userName}>{user?.name}</h3>
                        </div>
                    </div>

                    <div style={styles.menu}>
                        <button
                            onClick={() => setActiveTab('profile')}
                            style={{ ...styles.menuItem, ...(activeTab === 'profile' ? styles.activeMenuItem : {}) }}
                        >
                            <FaUser /> Profile Information
                            <FaChevronRight style={styles.chevron} />
                        </button>
                        <button
                            onClick={() => setActiveTab('addresses')}
                            style={{ ...styles.menuItem, ...(activeTab === 'addresses' ? styles.activeMenuItem : {}) }}
                        >
                            <FaMapMarkerAlt /> Manage Addresses
                            <FaChevronRight style={styles.chevron} />
                        </button>
                        <div style={styles.menuDivider}></div>
                        <button onClick={() => { logout(); navigate('/'); }} style={styles.logoutBtn}>
                            <FaSignOutAlt /> Logout
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main style={styles.mainContent} className="profile-main">
                    <AnimatePresence mode="wait">
                        {activeTab === 'profile' ? (
                            <motion.div
                                key="profile-tab"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                style={styles.tabPane}
                            >
                                <section style={styles.infoSection}>
                                    <div style={styles.sectionHeader}>
                                        <h3 style={styles.sectionTitle}>Personal Information</h3>
                                        <button
                                            onClick={() => isEditing.personal ? updateHandler('personal') : setIsEditing({ ...isEditing, personal: true })}
                                            style={styles.editBtn}
                                        >
                                            {isEditing.personal ? 'Save' : 'Edit'}
                                        </button>
                                    </div>
                                    <div style={styles.gridFields}>
                                        <div style={styles.fieldGroup}>
                                            <label style={styles.fieldLabel}>Name</label>
                                            <input
                                                disabled={!isEditing.personal}
                                                value={profileData.name}
                                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                style={styles.fieldInput}
                                            />
                                        </div>
                                    </div>
                                    <div style={styles.genderSection}>
                                        <p style={styles.fieldLabel}>Your Gender</p>
                                        <div style={styles.radioGroup}>
                                            {['Male', 'Female', 'Other'].map(g => (
                                                <label key={g} style={styles.radioLabel}>
                                                    <input
                                                        type="radio"
                                                        name="gender"
                                                        value={g}
                                                        disabled={!isEditing.personal}
                                                        checked={profileData.gender === g}
                                                        onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                                                    /> {g}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </section>

                                <section style={styles.infoSection}>
                                    <div style={styles.sectionHeader}>
                                        <h3 style={styles.sectionTitle}>Email Address</h3>
                                        <button
                                            onClick={() => isEditing.email ? updateHandler('email') : setIsEditing({ ...isEditing, email: true })}
                                            style={styles.editBtn}
                                        >
                                            {isEditing.email ? 'Save' : 'Edit'}
                                        </button>
                                    </div>
                                    <input
                                        disabled={!isEditing.email}
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                        style={styles.fieldInput}
                                    />
                                </section>

                                <section style={styles.infoSection}>
                                    <div style={styles.sectionHeader}>
                                        <h3 style={styles.sectionTitle}>Mobile Number</h3>
                                        <button
                                            onClick={() => isEditing.phone ? updateHandler('phone') : setIsEditing({ ...isEditing, phone: true })}
                                            style={styles.editBtn}
                                        >
                                            {isEditing.phone ? 'Save' : 'Edit'}
                                        </button>
                                    </div>
                                    <input
                                        disabled={!isEditing.phone}
                                        value={profileData.phone}
                                        placeholder="+91 Mobile Number"
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                        style={styles.fieldInput}
                                    />
                                </section>

                                <section style={styles.infoSection}>
                                    <div style={styles.sectionHeader}>
                                        <h3 style={styles.sectionTitle}>Change Password</h3>
                                        <button
                                            onClick={() => isEditing.password ? updateHandler('password') : setIsEditing({ ...isEditing, password: true })}
                                            style={styles.editBtn}
                                        >
                                            {isEditing.password ? 'Save Password' : 'Edit'}
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={styles.fieldGroup}>
                                            <label style={styles.fieldLabel}>Current Password</label>
                                            <input
                                                type="password"
                                                disabled={!isEditing.password}
                                                value={profileData.oldPassword}
                                                placeholder={isEditing.password ? "Enter your current password" : "••••••••"}
                                                onChange={(e) => setProfileData({ ...profileData, oldPassword: e.target.value })}
                                                style={styles.fieldInput}
                                            />
                                        </div>
                                        {isEditing.password && (
                                            <>
                                                <div style={styles.fieldGroup}>
                                                    <label style={styles.fieldLabel}>New Password</label>
                                                    <input
                                                        type="password"
                                                        value={profileData.password}
                                                        placeholder="Enter a new password"
                                                        onChange={(e) => setProfileData({ ...profileData, password: e.target.value })}
                                                        style={styles.fieldInput}
                                                    />
                                                </div>
                                                <div style={styles.fieldGroup}>
                                                    <label style={styles.fieldLabel}>Confirm New Password</label>
                                                    <input
                                                        type="password"
                                                        value={profileData.confirmPassword}
                                                        placeholder="Confirm your new password"
                                                        onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                                                        style={styles.fieldInput}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </section>

                                <div style={styles.dangerZone}>
                                    <button onClick={deactivateHandler} style={styles.dangerLink}>Deactivate Account</button>
                                    <button onClick={deleteAccountHandler} style={{ ...styles.dangerLink, color: '#ff6767' }}>Delete Account</button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="addresses-tab"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                style={styles.tabPane}
                            >
                                <div style={styles.sectionHeader}>
                                    <h3 style={styles.sectionTitle}>Manage Addresses</h3>
                                    <button onClick={() => {
                                        setShowAddressForm(!showAddressForm);
                                        setEditingAddressId(null);
                                        setNewAddress({ label: 'HOME', address: '', city: '', postalCode: '', country: '', phone: '' });
                                    }} style={styles.addBtn}>
                                        {showAddressForm ? 'Cancel' : '+ Add New Address'}
                                    </button>
                                </div>

                                {showAddressForm ? (
                                    <form onSubmit={handleAddressSubmit} style={styles.addressForm}>
                                        <div style={styles.radioGroup}>
                                            <label style={styles.radioLabel}><input type="radio" value="HOME" checked={newAddress.label === 'HOME'} onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })} /> Home</label>
                                            <label style={styles.radioLabel}><input type="radio" value="OFFICE" checked={newAddress.label === 'OFFICE'} onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })} /> Office</label>
                                        </div>
                                        <textarea placeholder="Address" value={newAddress.address} onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })} style={styles.fieldInput} required />
                                        <div style={styles.row}>
                                            <input placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} style={styles.halfInput} required />
                                            <input placeholder="Postal Code" value={newAddress.postalCode} onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })} style={styles.halfInput} required />
                                        </div>
                                        <div style={styles.row}>
                                            <input placeholder="Country" value={newAddress.country} onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })} style={styles.halfInput} required />
                                            <input placeholder="Phone" value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} style={styles.halfInput} required />
                                        </div>
                                        <button type="submit" style={styles.saveBtn}>{editingAddressId ? 'Update Address' : 'Save Address'}</button>
                                    </form>
                                ) : (
                                    <div style={styles.addressList}>
                                        {addresses.map((addr) => (
                                            <div key={addr._id} style={styles.addressCard}>
                                                <div>
                                                    <div style={styles.labelBadge}>{addr.label}</div>
                                                    <p style={styles.addrText}><strong>{addr.address}</strong></p>
                                                    <p style={styles.addrSub}>{addr.city}, {addr.postalCode}</p>
                                                    <p style={styles.addrSub}>Phone: {addr.phone}</p>
                                                </div>
                                                <div style={styles.actionBtns}>
                                                    <button onClick={() => editAddressHandler(addr)} style={styles.editIconBtn}>Edit</button>
                                                    <button onClick={() => deleteAddressHandler(addr._id)} style={styles.deleteBtn}>
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>

            {/* Background Accent */}
            <div style={styles.bgDecoration}></div>
            <style>{`
                @media (max-width: 768px) {
                    .profile-page { padding: 1rem !important; }
                    .profile-layout { flex-direction: column !important; }
                    .profile-sidebar { flex: none !important; width: 100% !important; margin-bottom: 1rem !important; }
                    .profile-main { padding: 1.5rem !important; min-height: auto !important; }
                    .profile-layout { gap: 1rem !important; }
                    input, textarea, select { max-width: 100% !important; }
                }
            `}</style>
        </div>
    );
};

const styles = {
    pageWrapper: {
        padding: '3rem 5%',
        minHeight: '100vh',
        background: '#f1f3f6',
        position: 'relative',
        overflow: 'hidden'
    },
    layout: {
        display: 'flex',
        gap: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 2
    },
    sidebar: {
        flex: '0 0 280px',
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
        height: 'fit-content'
    },
    userHead: {
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        borderBottom: '1px solid #f0f0f0'
    },
    avatarLarge: {
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        background: '#ff6b6b',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        boxShadow: '0 4px 10px rgba(255,107,107,0.3)'
    },
    userHeadText: {
        overflow: 'hidden'
    },
    greeting: { fontSize: '0.8rem', color: '#888', marginBottom: '2px' },
    userName: { fontSize: '1.1rem', color: '#333', fontWeight: '600' },
    menu: {
        padding: '1rem 0'
    },
    menuItem: {
        width: '100%',
        padding: '1.2rem 1.5rem',
        border: 'none',
        background: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        fontSize: '1rem',
        fontWeight: '600',
        color: '#878787',
        cursor: 'pointer',
        transition: 'all 0.3s',
        textAlign: 'left',
        position: 'relative'
    },
    activeMenuItem: {
        color: '#2874f0',
        background: '#f5faff'
    },
    chevron: {
        marginLeft: 'auto',
        fontSize: '0.8rem',
        opacity: 0.5
    },
    menuDivider: {
        height: '1px',
        background: '#f0f0f0',
        margin: '0.5rem 0'
    },
    logoutBtn: {
        width: '100%',
        padding: '1.2rem 1.5rem',
        border: 'none',
        background: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        fontSize: '1rem',
        fontWeight: '600',
        color: '#ff6b6b',
        cursor: 'pointer'
    },
    mainContent: {
        flex: 1,
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
        padding: '2rem',
        minHeight: '600px'
    },
    tabPane: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2.5rem'
    },
    infoSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    },
    sectionHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '0.5rem'
    },
    sectionTitle: {
        fontSize: '1.2rem',
        fontWeight: '600',
        color: '#333'
    },
    editBtn: {
        background: 'none',
        border: 'none',
        color: '#2874f0',
        fontWeight: 'bold',
        cursor: 'pointer',
        fontSize: '0.9rem'
    },
    fieldGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    },
    fieldLabel: {
        fontSize: '0.9rem',
        color: '#333',
        fontWeight: '500'
    },
    fieldInput: {
        padding: '0.8rem 1rem',
        borderRadius: '4px',
        border: '1px solid #e0e0e0',
        background: '#f9f9f9',
        fontSize: '1rem',
        color: '#333',
        width: '100%',
        maxWidth: '400px',
        transition: 'all 0.3s'
    },
    genderSection: {
        marginTop: '0.5rem'
    },
    radioGroup: {
        display: 'flex',
        gap: '2rem',
        marginTop: '0.8rem'
    },
    radioLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
        fontSize: '0.95rem'
    },
    dangerZone: {
        marginTop: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        paddingTop: '2rem',
        borderTop: '1px solid #f0f0f0'
    },
    dangerLink: {
        background: 'none',
        border: 'none',
        color: '#2874f0',
        fontWeight: '600',
        textAlign: 'left',
        cursor: 'pointer',
        fontSize: '0.9rem'
    },
    addBtn: {
        background: 'none',
        border: 'none',
        color: '#2874f0',
        fontWeight: '600',
        cursor: 'pointer'
    },
    addressForm: {
        background: '#f9faff',
        padding: '1.5rem',
        borderRadius: '8px',
        border: '1px solid #eef2ff',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    },
    row: { display: 'flex', gap: '1rem' },
    halfInput: { flex: 1, padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd' },
    saveBtn: { padding: '1rem', background: '#ff6b6b', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' },
    addressList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
    },
    addressCard: {
        padding: '1.5rem',
        border: '1px solid #f0f0f0',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    labelBadge: {
        background: '#f0f0f0',
        color: '#878787',
        fontSize: '0.7rem',
        fontWeight: 'bold',
        padding: '2px 8px',
        borderRadius: '4px',
        textTransform: 'uppercase',
        marginBottom: '0.5rem',
        display: 'inline-block'
    },
    addrText: { fontSize: '1rem', color: '#333', marginBottom: '0.3rem' },
    addrSub: { fontSize: '0.9rem', color: '#888' },
    actionBtns: { display: 'flex', gap: '1rem', alignItems: 'center' },
    editIconBtn: { background: 'none', border: 'none', color: '#2874f0', cursor: 'pointer', fontWeight: 'bold' },
    deleteBtn: { background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.1rem' },
    bgDecoration: {
        position: 'absolute',
        bottom: '-100px',
        left: '0',
        width: '100%',
        height: '300px',
        background: 'linear-gradient(to top, #fefdfa33 0%, transparent 100%)',
        zIndex: 1,
        pointerEvents: 'none'
    }
};

export default Profile;
