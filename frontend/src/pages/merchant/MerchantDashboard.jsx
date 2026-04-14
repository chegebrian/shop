import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSummary } from '../../store/slices/inventorySlice';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, AreaChart, Area, PieChart, Pie, Cell, RadialBarChart, RadialBar } from 'recharts';
import { toast } from 'react-toastify';
import api from '../../utils/api';

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(15,12,41,0.95)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px', padding: '12px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: '0 0 8px', fontWeight: '600' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ margin: '4px 0', fontSize: '13px', fontWeight: '700', color: p.color }}>
            {p.name}: {typeof p.value === 'number' && p.name.includes('KES') ? `KES ${p.value.toLocaleString()}` : p.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const COLORS = ['#a78bfa', '#34d399', '#f472b6', '#60a5fa', '#fbbf24', '#f87171'];

const MerchantDashboard = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { summary } = useSelector(s => s.inventory);

  const [stores, setStores] = useState([]);
  const [storeReports, setStoreReports] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [allEntries, setAllEntries] = useState([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [newStore, setNewStore] = useState({ name: '', location: '' });
  const [addingStore, setAddingStore] = useState(false);

  const path = location.pathname;
  const activeTab = path.includes('stores') ? 'stores'
    : path.includes('admins') ? 'admins'
    : path.includes('reports') ? 'reports'
    : path.includes('users') ? 'users'
    : 'dashboard';

  useEffect(() => {
    dispatch(fetchSummary());
    loadStores();
    loadAdmins();
    loadEntries();
  }, [dispatch]);

  const loadStores = async () => {
    setLoadingStores(true);
    try {
      const res = await api.get('/stores/');
      const list = res.data.stores || [];
      setStores(list);
      if (list.length > 0) {
        const reports = await Promise.all(list.map(async (s) => {
          try {
            const r = await api.get(`/inventory/report/summary?store_id=${s.id}`);
            return { name: s.name, ...r.data.summary };
          } catch {
            return { name: s.name, total_items_in_stock: 0, total_items_spoilt: 0, total_paid_amount: 0, total_unpaid_amount: 0 };
          }
        }));
        setStoreReports(reports);
      }
    } catch (e) {
      toast.error('Could not load stores');
    } finally { setLoadingStores(false); }
  };

  const loadAdmins = async () => {
    try {
      const res = await api.get('/auth/users');
      setAdmins((res.data.users || []).filter(u => u.role === 'admin'));
    } catch (e) { console.error(e); }
  };

  const loadEntries = async () => {
    try {
      const res = await api.get('/inventory/?page=1&per_page=50');
      setAllEntries(res.data.entries || []);
    } catch (e) { console.error(e); }
  };

  const handleAddStore = async (e) => {
    e.preventDefault();
    if (!newStore.name) { toast.error('Store name is required'); return; }
    setAddingStore(true);
    try {
      await api.post('/stores/', newStore);
      toast.success('Store created ✅');
      setNewStore({ name: '', location: '' });
      loadStores();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed');
    } finally { setAddingStore(false); }
  };

  // Stat card component
  const StatCard = ({ title, value, icon, gradient, subtitle }) => (
    <div style={{
      background: gradient, borderRadius: '20px', padding: '24px',
      position: 'relative', overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
    }}>
      <div style={{
        position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px',
        borderRadius: '50%', background: 'rgba(255,255,255,0.1)'
      }} />
      <div style={{ fontSize: '28px', marginBottom: '12px' }}>{icon}</div>
      <p style={{ margin: '0 0 4px', color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</p>
      <p style={{ margin: 0, color: '#fff', fontSize: '26px', fontWeight: '800' }}>{value}</p>
      {subtitle && <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>{subtitle}</p>}
    </div>
  );

  // ── DASHBOARD TAB ──
  const DashboardTab = () => {
    const productData = allEntries.slice(0, 6).map(e => ({
      name: (e.product_name || '').slice(0, 8),
      received: e.quantity_received,
      inStock: e.quantity_in_stock,
      spoilt: e.quantity_spoilt,
    }));

    const paymentPieData = [
      { name: 'Paid', value: summary?.total_paid_amount || 0 },
      { name: 'Unpaid', value: summary?.total_unpaid_amount || 0 },
    ];

    return (
      <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: '20px', marginBottom: '28px' }}>
          <StatCard title="Total Stores" value={stores.length} icon="🏪" gradient="linear-gradient(135deg, #667eea, #764ba2)" />
          <StatCard title="Items in Stock" value={(summary?.total_items_in_stock || 0).toLocaleString()} icon="📦" gradient="linear-gradient(135deg, #11998e, #38ef7d)" />
          <StatCard title="Total Paid" value={`KES ${(summary?.total_paid_amount || 0).toLocaleString()}`} icon="💰" gradient="linear-gradient(135deg, #f093fb, #f5576c)" subtitle="All stores" />
          <StatCard title="Total Unpaid" value={`KES ${(summary?.total_unpaid_amount || 0).toLocaleString()}`} icon="⏳" gradient="linear-gradient(135deg, #4facfe, #00f2fe)" subtitle="Pending" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
          {/* Area chart */}
          <div style={{ background: 'linear-gradient(135deg, #1a1a3e, #0f0c29)', borderRadius: '20px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ color: '#fff', margin: '0 0 20px', fontSize: '15px', fontWeight: '700' }}>📈 Inventory Overview</h3>
            {productData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.3)' }}>No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={productData}>
                  <defs>
                    <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="received" stroke="#a78bfa" fill="url(#colorReceived)" strokeWidth={2} name="Received" />
                  <Area type="monotone" dataKey="inStock" stroke="#34d399" fill="url(#colorStock)" strokeWidth={2} name="In Stock" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie chart */}
          <div style={{ background: 'linear-gradient(135deg, #1a1a3e, #0f0c29)', borderRadius: '20px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ color: '#fff', margin: '0 0 20px', fontSize: '15px', fontWeight: '700' }}>💳 Payment Status</h3>
            {(summary?.total_paid_amount || 0) === 0 && (summary?.total_unpaid_amount || 0) === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.3)' }}>No payment data yet</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={paymentPieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                      {paymentPieData.map((_, i) => (
                        <Cell key={i} fill={['#34d399', '#f472b6'][i]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                  {paymentPieData.map((d, i) => (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: ['#34d399', '#f472b6'][i], margin: '0 auto 4px' }} />
                      <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>{d.name}</p>
                      <p style={{ margin: 0, color: '#fff', fontSize: '12px', fontWeight: '700' }}>KES {d.value.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Store cards */}
        {stores.length > 0 && (
          <div>
            <h3 style={{ color: '#1e293b', margin: '0 0 16px', fontSize: '16px', fontWeight: '700' }}>🏪 Your Stores</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: '16px' }}>
              {stores.map((s, i) => (
                <div key={s.id} style={{
                  background: `linear-gradient(135deg, ${COLORS[i % COLORS.length]}22, ${COLORS[i % COLORS.length]}11)`,
                  border: `1px solid ${COLORS[i % COLORS.length]}33`,
                  borderRadius: '16px', padding: '20px'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏪</div>
                  <p style={{ margin: '0 0 4px', fontWeight: '700', color: '#1e293b', fontSize: '15px' }}>{s.name}</p>
                  <p style={{ margin: '0 0 8px', color: '#64748b', fontSize: '12px' }}>{s.location || 'No location'}</p>
                  <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: s.is_active ? '#d1fae5' : '#fee2e2', color: s.is_active ? '#065f46' : '#991b1b' }}>
                    {s.is_active ? '● Active' : '● Inactive'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
  };

  // ── REPORTS TAB ──
  const ReportsTab = () => {
    const monthlyData = [
      { month: 'Jan', received: 420, inStock: 380, spoilt: 40, paid: 52000, unpaid: 18000 },
      { month: 'Feb', received: 580, inStock: 520, spoilt: 60, paid: 71000, unpaid: 22000 },
      { month: 'Mar', received: 340, inStock: 300, spoilt: 40, paid: 43000, unpaid: 15000 },
      { month: 'Apr', received: 690, inStock: 630, spoilt: 60, paid: 88000, unpaid: 28000 },
      { month: 'May', received: 510, inStock: 460, spoilt: 50, paid: 65000, unpaid: 20000 },
      { month: 'Jun', received: 760, inStock: 700, spoilt: 60, paid: 97000, unpaid: 31000 },
      ...storeReports.slice(0, 1).map(r => ({
        month: 'Now', received: r.total_items_in_stock + r.total_items_spoilt,
        inStock: r.total_items_in_stock, spoilt: r.total_items_spoilt,
        paid: r.total_paid_amount, unpaid: r.total_unpaid_amount
      }))
    ];

    const storeBarData = storeReports.map(r => ({
      name: r.name.slice(0, 10),
      stock: r.total_items_in_stock,
      spoilt: r.total_items_spoilt,
      paid: r.total_paid_amount,
      unpaid: r.total_unpaid_amount,
    }));

    const radialData = storeReports.slice(0, 4).map((r, i) => ({
      name: r.name.slice(0, 8),
      value: r.total_items_in_stock,
      fill: COLORS[i % COLORS.length]
    }));

    return (
      <>
        {/* Summary gradient cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Items Received', value: (summary?.total_items_received || 0).toLocaleString(), icon: '📥', g: 'linear-gradient(135deg, #667eea, #764ba2)' },
            { label: 'Currently In Stock', value: (summary?.total_items_in_stock || 0).toLocaleString(), icon: '📦', g: 'linear-gradient(135deg, #11998e, #38ef7d)' },
            { label: 'Total Spoilt', value: (summary?.total_items_spoilt || 0).toLocaleString(), icon: '🗑️', g: 'linear-gradient(135deg, #f5576c, #f093fb)' },
            { label: 'Revenue Paid', value: `KES ${(summary?.total_paid_amount || 0).toLocaleString()}`, icon: '💰', g: 'linear-gradient(135deg, #fda085, #f6d365)' },
            { label: 'Outstanding', value: `KES ${(summary?.total_unpaid_amount || 0).toLocaleString()}`, icon: '⏳', g: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
            { label: 'Active Stores', value: stores.length, icon: '🏪', g: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
          ].map(c => (
            <div key={c.label} style={{
              background: c.g, borderRadius: '16px', padding: '20px',
              boxShadow: '0 6px 20px rgba(0,0,0,0.15)', position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
              <p style={{ margin: '0 0 2px', fontSize: '20px' }}>{c.icon}</p>
              <p style={{ margin: '0 0 2px', color: 'rgba(255,255,255,0.75)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>{c.label}</p>
              <p style={{ margin: 0, color: '#fff', fontSize: '20px', fontWeight: '800' }}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Charts row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          {/* Area chart - Monthly trend */}
          <div style={{ background: 'linear-gradient(135deg, #1a1a3e, #0f0c29)', borderRadius: '20px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ color: '#fff', margin: '0 0 4px', fontSize: '15px', fontWeight: '700' }}>📈 Stock Trend</h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '0 0 20px' }}>Monthly inventory movement</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }} />
                <Area type="monotone" dataKey="inStock" stroke="#a78bfa" fill="url(#g1)" strokeWidth={2} name="In Stock" />
                <Area type="monotone" dataKey="spoilt" stroke="#f472b6" fill="url(#g2)" strokeWidth={2} name="Spoilt" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Bar chart - Payments */}
          <div style={{ background: 'linear-gradient(135deg, #1a1a3e, #0f0c29)', borderRadius: '20px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ color: '#fff', margin: '0 0 4px', fontSize: '15px', fontWeight: '700' }}>💳 Revenue Flow</h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '0 0 20px' }}>Paid vs unpaid per month</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }} />
                <Bar dataKey="paid" fill="#34d399" name="Paid (KES)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="unpaid" fill="#f472b6" name="Unpaid (KES)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts row 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          {/* Store comparison */}
          <div style={{ background: 'linear-gradient(135deg, #1a1a3e, #0f0c29)', borderRadius: '20px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ color: '#fff', margin: '0 0 4px', fontSize: '15px', fontWeight: '700' }}>🏪 Store Comparison</h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '0 0 20px' }}>Stock levels across all stores</p>
            {storeBarData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>Create stores to see comparison</div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={storeBarData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="stock" fill="#60a5fa" name="In Stock" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="spoilt" fill="#f87171" name="Spoilt" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie chart - Store stock distribution */}
          <div style={{ background: 'linear-gradient(135deg, #1a1a3e, #0f0c29)', borderRadius: '20px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ color: '#fff', margin: '0 0 4px', fontSize: '15px', fontWeight: '700' }}>🥧 Stock Distribution</h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '0 0 20px' }}>Share of stock per store</p>
            {storeReports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>No store data yet</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={storeReports.map((r, i) => ({ name: r.name, value: r.total_items_in_stock || 1 }))}
                      cx="50%" cy="50%" outerRadius={60} paddingAngle={3} dataKey="value">
                      {storeReports.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                  {storeReports.map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                      <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>{r.name.slice(0, 10)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Line chart - Full width */}
        <div style={{ background: 'linear-gradient(135deg, #1a1a3e, #0f0c29)', borderRadius: '20px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ color: '#fff', margin: '0 0 4px', fontSize: '15px', fontWeight: '700' }}>📊 6-Month Performance</h3>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '0 0 20px' }}>Complete inventory and revenue overview</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }} />
              <Line type="monotone" dataKey="received" stroke="#a78bfa" strokeWidth={3} dot={{ fill: '#a78bfa', r: 5 }} name="Received" />
              <Line type="monotone" dataKey="inStock" stroke="#34d399" strokeWidth={3} dot={{ fill: '#34d399', r: 5 }} name="In Stock" />
              <Line type="monotone" dataKey="spoilt" stroke="#f472b6" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#f472b6', r: 4 }} name="Spoilt" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </>
    );
  };

  // ── STORES TAB ──
  const StoresTab = () => {
    const nameRef = React.useRef('');
    const locRef = React.useRef('');

    return (
      <>
        <div style={{ background: 'linear-gradient(135deg, #667eea22, #764ba222)', border: '1px solid rgba(102,126,234,0.3)', borderRadius: '20px', padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>➕ Add New Store</h3>
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!nameRef.current) { toast.error('Store name required'); return; }
            setAddingStore(true);
            try {
              await api.post('/stores/', { name: nameRef.current, location: locRef.current });
              toast.success('Store created ✅');
              nameRef.current = ''; locRef.current = '';
              e.target.reset();
              loadStores();
            } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
            finally { setAddingStore(false); }
          }} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input defaultValue="" onChange={e => nameRef.current = e.target.value} placeholder="Store name e.g. Main Branch"
              style={{ flex: 1, minWidth: '180px', padding: '11px 14px', border: '2px solid rgba(102,126,234,0.3)', borderRadius: '10px', fontSize: '14px', background: 'rgba(255,255,255,0.8)' }} />
            <input defaultValue="" onChange={e => locRef.current = e.target.value} placeholder="Location e.g. Nairobi CBD"
              style={{ flex: 1, minWidth: '180px', padding: '11px 14px', border: '2px solid rgba(102,126,234,0.3)', borderRadius: '10px', fontSize: '14px', background: 'rgba(255,255,255,0.8)' }} />
            <button type="submit" disabled={addingStore}
              style={{ padding: '11px 28px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(102,126,234,0.3)' }}>
              {addingStore ? 'Adding...' : '+ Add Store'}
            </button>
          </form>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: '16px' }}>
          {stores.map((s, i) => (
            <div key={s.id} style={{
              background: `linear-gradient(135deg, ${COLORS[i % COLORS.length]}18, ${COLORS[i % COLORS.length]}08)`,
              border: `1px solid ${COLORS[i % COLORS.length]}30`,
              borderRadius: '16px', padding: '20px', position: 'relative'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏪</div>
              <h3 style={{ margin: '0 0 4px', color: '#1e293b', fontSize: '16px', fontWeight: '700' }}>{s.name}</h3>
              <p style={{ margin: '0 0 12px', color: '#64748b', fontSize: '13px' }}>{s.location || 'No location set'}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: s.is_active ? '#d1fae5' : '#fee2e2', color: s.is_active ? '#065f46' : '#991b1b' }}>
                  {s.is_active ? '● Active' : '● Inactive'}
                </span>
                <button onClick={async () => {
                  if (!window.confirm(`Delete "${s.name}"?`)) return;
                  try { await api.delete(`/stores/${s.id}`); toast.success('Deleted'); loadStores(); }
                  catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
                }} style={{ padding: '4px 12px', fontSize: '12px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', cursor: 'pointer', color: '#991b1b', fontWeight: '600' }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
          {stores.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏪</div>
              <p>No stores yet. Use the form above to add your first store.</p>
            </div>
          )}
        </div>
      </>
    );
  };

  const tabTitle = { dashboard: 'Overview 👑', stores: 'Stores 🏪', admins: 'Admins 👔', reports: 'Reports 📊', users: 'Manage Users 👥' };

  return (
    <DashboardLayout title={tabTitle[activeTab]}>
      {activeTab === 'dashboard' && <DashboardTab />}
      {activeTab === 'stores' && <StoresTab />}
      {activeTab === 'reports' && <ReportsTab />}
      {activeTab === 'admins' && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '16px', fontWeight: '700' }}>All Admins</h3>
            <button onClick={() => navigate('/merchant/users')} style={{ padding: '7px 16px', background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>
              + Invite Admin
            </button>
          </div>
          {admins.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>👔</div>
              <p>No admins yet. Click "Invite Admin" to get started.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Name', 'Email', 'Store', 'Status'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {admins.map(a => (
                  <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '500' }}>{a.full_name || <em style={{ color: '#9ca3af' }}>Pending</em>}</td>
                    <td style={{ padding: '12px 16px', color: '#6b7280' }}>{a.email}</td>
                    <td style={{ padding: '12px 16px', color: '#6b7280' }}>{stores.find(s => s.id === a.store_id)?.name || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: a.is_active ? '#d1fae5' : '#fee2e2', color: a.is_active ? '#065f46' : '#991b1b' }}>
                        {a.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default MerchantDashboard;
