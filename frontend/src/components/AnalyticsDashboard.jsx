import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { motion } from 'framer-motion';
import { FaDollarSign, FaShoppingCart, FaUsers, FaUtensils } from 'react-icons/fa';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff6b6b'];

const AnalyticsDashboard = ({ data, type }) => {
    if (!data) return null;

    const { stats, orderStats, revenueTrend, topSellingItems } = data;

    // Convert orderStats for PieChart
    const pieData = orderStats?.map(item => ({ name: item._id, value: item.count })) || [];

    // Calculate growth percentage (Today vs Yesterday)
    const today = stats.todayRevenue || 0;
    const yesterday = stats.yesterdayRevenue || 0;
    const growth = yesterday > 0 ? ((today - yesterday) / yesterday) * 100 : 0;

    return (
        <div style={styles.container}>
            {/* Stats Overview */}
            <div style={styles.statsGrid}>
                <motion.div style={styles.statCard} whileHover={{ y: -5 }}>
                    <div style={{ ...styles.iconBox, backgroundColor: '#e3f2fd' }}>
                        <FaDollarSign color="#1976d2" />
                    </div>
                    <div>
                        <p style={styles.statLabel}>Total Revenue</p>
                        <h3 style={styles.statValue}>₹{stats.totalRevenue.toLocaleString()}</h3>
                    </div>
                </motion.div>

                <motion.div style={styles.statCard} whileHover={{ y: -5 }}>
                    <div style={{ ...styles.iconBox, backgroundColor: '#e8f5e9' }}>
                        <FaDollarSign color="#2e7d32" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={styles.statLabel}>Today's Revenue</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <h3 style={styles.statValue}>₹{today.toLocaleString()}</h3>
                            {growth !== 0 && (
                                <span style={{ 
                                    fontSize: '0.75rem', 
                                    fontWeight: 'bold', 
                                    color: growth > 0 ? '#2e7d32' : '#d32f2f',
                                    background: growth > 0 ? '#c8e6c9' : '#ffcdd2',
                                    padding: '2px 6px',
                                    borderRadius: '10px'
                                }}>
                                    {growth > 0 ? '+' : ''}{growth.toFixed(1)}%
                                </span>
                            )}
                        </div>
                    </div>
                </motion.div>

                <motion.div style={styles.statCard} whileHover={{ y: -5 }}>
                    <div style={{ ...styles.iconBox, backgroundColor: '#f5f5f5' }}>
                        <FaShoppingCart color="#616161" />
                    </div>
                    <div>
                        <p style={styles.statLabel}>Total Orders</p>
                        <h3 style={styles.statValue}>{stats.totalOrders}</h3>
                    </div>
                </motion.div>

                {type === 'admin' ? (
                    <motion.div style={styles.statCard} whileHover={{ y: -5 }}>
                        <div style={{ ...styles.iconBox, backgroundColor: '#fff3e0' }}>
                            <FaUsers color="#f57c00" />
                        </div>
                        <div>
                            <p style={styles.statLabel}>Total Users</p>
                            <h3 style={styles.statValue}>{stats.totalUsers}</h3>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div style={styles.statCard} whileHover={{ y: -5 }}>
                        <div style={{ ...styles.iconBox, backgroundColor: '#f3e5f5' }}>
                            <FaUtensils color="#7b1fa2" />
                        </div>
                        <div>
                            <p style={styles.statLabel}>Top Items</p>
                            <h3 style={styles.statValue}>{stats.topItemsCount}</h3>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Charts Section */}
            <div style={styles.chartsGrid}>
                {/* Revenue Trend Chart */}
                <div style={styles.chartWrapper}>
                    <h4 style={styles.chartTitle}>Revenue Trend (Last 7 Days)</h4>
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                <XAxis dataKey="name" fontSize={12} tickMargin={10} />
                                <YAxis fontSize={12} tickFormatter={(val) => `₹${val}`} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => [`₹${value}`, 'Revenue']}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="#ff6b6b" 
                                    strokeWidth={3} 
                                    dot={{ fill: '#ff6b6b', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Order Status Breakdown */}
                <div style={styles.chartWrapper}>
                    <h4 style={styles.chartTitle}>Order Status Breakdown</h4>
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Daily Status Table */}
                <div style={{ ...styles.chartWrapper, gridColumn: 'span 2' }}>
                    <h4 style={styles.chartTitle}>Daily Revenue Breakdown</h4>
                    <div style={styles.tableWrapper}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Date</th>
                                    <th style={styles.th}>Revenue</th>
                                    <th style={styles.th}>Performance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...revenueTrend].reverse().map((day, idx) => (
                                    <tr key={idx} style={styles.tr}>
                                        <td style={styles.td}>{new Date(day.name).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                        <td style={styles.td}>₹{day.value.toLocaleString()}</td>
                                        <td style={styles.td}>
                                            <div style={{ height: '8px', width: '100px', background: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{ 
                                                    height: '100%', 
                                                    width: `${Math.min((day.value / Math.max(...revenueTrend.map(d => d.value))) * 100, 100)}%`, 
                                                    background: '#ff6b6b' 
                                                }} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Selling Items (Restaurant Only) */}
                {type === 'restaurant' && topSellingItems && topSellingItems.length > 0 && (
                    <div style={{ ...styles.chartWrapper, gridColumn: 'span 2' }}>
                        <h4 style={styles.chartTitle}>Top 5 Selling Items</h4>
                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topSellingItems} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                                    <XAxis type="number" fontSize={12} />
                                    <YAxis type="category" dataKey="name" fontSize={12} width={100} />
                                    <Tooltip cursor={{fill: '#f5f5f5'}} />
                                    <Bar dataKey="value" fill="#4caf50" radius={[0, 10, 10, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '1rem',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
    },
    statCard: {
        background: 'white',
        padding: '1.5rem',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        border: '1px solid #f0f0f0',
    },
    iconBox: {
        width: '50px',
        height: '50px',
        borderRadius: '15px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.4rem',
    },
    statLabel: {
        fontSize: '0.85rem',
        color: '#777',
        margin: 0,
    },
    statValue: {
        fontSize: '1.4rem',
        fontWeight: '800',
        color: '#222',
        margin: 0,
    },
    chartsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '2rem',
    },
    chartWrapper: {
        background: 'white',
        padding: '2rem',
        borderRadius: '24px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
        border: '1px solid #f0f0f0',
    },
    chartTitle: {
        fontSize: '1.1rem',
        fontWeight: '700',
        color: '#333',
        marginBottom: '1.5rem',
    },
    tableWrapper: {
        overflowX: 'auto',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '1rem',
    },
    th: {
        textAlign: 'left',
        padding: '1rem',
        borderBottom: '2px solid #eee',
        color: '#666',
        fontSize: '0.9rem',
    },
    tr: {
        transition: 'background 0.3s',
        '&:hover': { background: '#fcfcfc' }
    },
    td: {
        padding: '1rem',
        borderBottom: '1px solid #eee',
        fontSize: '0.95rem',
        color: '#444',
    }
};

export default AnalyticsDashboard;
