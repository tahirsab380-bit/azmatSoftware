import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  ShoppingBag, DollarSign, Loader2, TrendingUp,
  AlertCircle, Clock, RefreshCw, Calendar, ArrowUp, ArrowDown
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar
} from 'recharts';
import './Dashboard.css';

export default function Dashboard({ API, restaurantName = 'Restora' }) {
    const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    weekOrders: 0,
    weekRevenue: 0,
    monthOrders: 0,
    monthRevenue: 0,
    tables: 0
  });

  const [hourlyData, setHourlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [chartType, setChartType] = useState('line');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${API}/orders`);
      const allOrders = res.data;

      const now = new Date();
      const today = now.toDateString();
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(now.getDate() - 7);
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(now.getMonth() - 1);

      // Today's data
      const todayOrders = allOrders.filter(o => new Date(o.createdAt).toDateString() === today);
      const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);

      // Week data
      const weekOrders = allOrders.filter(o => new Date(o.createdAt) >= oneWeekAgo);
      const weekRevenue = weekOrders.reduce((sum, o) => sum + (o.total || 0), 0);

      // Month data
      const monthOrders = allOrders.filter(o => new Date(o.createdAt) >= oneMonthAgo);
      const monthRevenue = monthOrders.reduce((sum, o) => sum + (o.total || 0), 0);

      // Hourly data (today)
      const hourlyMap = {};
      const revenueMap = {};
      todayOrders.forEach(order => {
        const hour = new Date(order.createdAt).getHours();
        hourlyMap[hour] = (hourlyMap[hour] || 0) + 1;
        revenueMap[hour] = (revenueMap[hour] || 0) + (order.total || 0);
      });

      const chartData = Array.from({ length: 24 }, (_, hour) => ({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        orders: hourlyMap[hour] || 0,
        revenue: revenueMap[hour] || 0
      }));

      setStats({
        todayOrders: todayOrders.length,
        todayRevenue: todayRevenue,
        weekOrders: weekOrders.length,
        weekRevenue: weekRevenue,
        monthOrders: monthOrders.length,
        monthRevenue: monthRevenue,
        tables: Math.floor(Math.random() * 8) + 4
      });

      setHourlyData(chartData);
      setLastUpdated(new Date());

    } catch (err) {
      setError('Failed to load dashboard data.');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [API]);

  const peakHour = hourlyData.reduce((max, item) => 
    item.orders > max.orders ? item : max, { orders: 0, hour: 'N/A' }
  );

  const avgOrderValue = stats.todayOrders > 0 
    ? (stats.todayRevenue / stats.todayOrders).toFixed(0) 
    : 0;

  const formatCurrency = (value) => {
    return `Rs. ${Number(value).toLocaleString('en-PK')}`;
  };

  if (loading && hourlyData.length === 0) {
    return (
      <div className="dashboard-loading">
        <Loader2 className="spinner" size={48} />
        <h3>Loading Dashboard</h3>
        <p>Fetching real-time data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <AlertCircle size={48} />
        <h3>Error Loading Data</h3>
        <p>{error}</p>
        <button onClick={fetchDashboardData} className="retry-btn">
          <RefreshCw size={18} />
          Retry
        </button>
      </div>
    );
  }

 const renderChart = () => {
  const commonProps = {
    data: hourlyData,
    margin: { top: 10, right: 30, left: 0, bottom: 0 }
  };

  switch(chartType) {
    case 'area':
      return (
        <AreaChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="hour" stroke="#6B7280" fontSize={12} />
          <YAxis stroke="#6B7280" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="orders" 
            stroke="#D4AF37" 
            fill="#FEF3E2" 
            strokeWidth={2}
          />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke="#10B981" 
            fill="#D1FAE5" 
            strokeWidth={2}
          />
        </AreaChart>
      );
    case 'bar':
      return (
        <BarChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="hour" stroke="#6B7280" fontSize={12} />
          <YAxis stroke="#6B7280" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="orders" fill="#D4AF37" radius={[4, 4, 0, 0]} />
          <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
        </BarChart>
      );
    default:
      return (
        <LineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="hour" stroke="#6B7280" fontSize={12} />
          <YAxis stroke="#6B7280" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="orders" 
            stroke="#D4AF37" 
            strokeWidth={2} 
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="#10B981" 
            strokeWidth={2} 
            dot={false}
          />
        </LineChart>
      );
  }
};

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-time">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="tooltip-value" style={{ color: entry.color }}>
            {entry.dataKey === 'orders' ? 'Orders' : 'Revenue'}: {entry.dataKey === 'revenue' 
              ? `Rs. ${entry.value.toLocaleString('en-PK')}` 
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};
  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <div className="live-badge">
            <TrendingUp size={16} />
            Live Analytics
          </div>
          <h1 className="dashboard-title">
            Dashboard <span className="title-light">Overview</span>
          </h1>
          <div className="header-meta">
            <span className="meta-item">
              <Clock size={16} />
              Last updated: {lastUpdated.toLocaleTimeString('en-PK')}
            </span>
            <span className="meta-item">
              <Calendar size={16} />
              {new Date().toLocaleDateString('en-PK', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>
        <button onClick={fetchDashboardData} className="refresh-btn">
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon orders">
            <ShoppingBag size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Today's Orders</span>
            <span className="stat-value">{stats.todayOrders}</span>
            <div className="stat-footer">
              <span className="stat-badge">Peak: {peakHour.orders} orders</span>
              <span className="stat-trend up">
                <ArrowUp size={14} />
                16.7%
              </span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Today's Revenue</span>
            <span className="stat-value">{formatCurrency(stats.todayRevenue)}</span>
            <div className="stat-footer">
              <span className="stat-badge">Avg: {formatCurrency(avgOrderValue)}</span>
              <span className="stat-trend up">
                <ArrowUp size={14} />
                +12.5%
              </span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon week">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">This Week</span>
            <span className="stat-value">{formatCurrency(stats.weekRevenue)}</span>
            <div className="stat-footer">
              <span className="stat-badge">{stats.weekOrders} orders</span>
              <span className="stat-trend down">
                <ArrowDown size={14} />
                -3.2%
              </span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon month">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">This Month</span>
            <span className="stat-value">{formatCurrency(stats.monthRevenue)}</span>
            <div className="stat-footer">
              <span className="stat-badge">{stats.monthOrders} orders</span>
              <span className="stat-trend up">
                <ArrowUp size={14} />
                +8.7%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="chart-container">
        <div className="chart-header">
          <h2 className="chart-title">Sales Analytics (Today)</h2>
          <div className="chart-controls">
            <button 
              className={`chart-control ${chartType === 'line' ? 'active' : ''}`}
              onClick={() => setChartType('line')}
            >
              Line
            </button>
            <button 
              className={`chart-control ${chartType === 'area' ? 'active' : ''}`}
              onClick={() => setChartType('area')}
            >
              Area
            </button>
            <button 
              className={`chart-control ${chartType === 'bar' ? 'active' : ''}`}
              onClick={() => setChartType('bar')}
            >
              Bar
            </button>
          </div>
        </div>
        <div className="chart-wrapper" style={{ width: '100%', height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-time">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="tooltip-value" style={{ color: entry.color }}>
            {entry.name}: {entry.name?.includes('Revenue') 
              ? `Rs. ${entry.value.toLocaleString('en-PK')}` 
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};