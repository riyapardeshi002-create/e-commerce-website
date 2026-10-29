import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  ArrowUpRight,
  Search,
  Check,
  X,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { adminApi, productsApi, formatINR } from '../api/client';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444'];

export default function AdminDashboard({ onExitAdmin }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'products' | 'orders' | 'customers'

  // Dashboard Data
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Products Management Data
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    brand: 'Nike',
    category: 'Running',
    description: '',
    price: '',
    salePrice: '',
    imageUrl: '',
    featured: false,
    sizes: [
      { size: 7, stockQuantity: 15 },
      { size: 8, stockQuantity: 20 },
      { size: 9, stockQuantity: 25 },
      { size: 10, stockQuantity: 18 },
      { size: 11, stockQuantity: 10 },
    ],
  });

  // Orders Management Data
  const [orders, setOrders] = useState([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // Customers Data
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (activeTab === 'products') loadProducts();
    if (activeTab === 'orders') loadOrders();
    if (activeTab === 'customers') loadCustomers();
  }, [activeTab, orderStatusFilter]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getDashboard();
      if (res.success) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await productsApi.getAll({ limit: 100 });
      if (res.success) setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadOrders = async () => {
    try {
      const params = {};
      if (orderStatusFilter !== 'All') params.status = orderStatusFilter;
      if (orderSearch.trim()) params.search = orderSearch.trim();
      const res = await adminApi.getOrders(params);
      if (res.success) setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadCustomers = async () => {
    try {
      const res = await adminApi.getCustomers();
      if (res.success) setCustomers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      slug: '',
      brand: 'Nike',
      category: 'Running',
      description: '',
      price: '',
      salePrice: '',
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
      featured: false,
      sizes: [
        { size: 7, stockQuantity: 15 },
        { size: 8, stockQuantity: 20 },
        { size: 9, stockQuantity: 25 },
        { size: 10, stockQuantity: 18 },
        { size: 11, stockQuantity: 10 },
      ],
    });
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      slug: prod.slug,
      brand: prod.brand,
      category: prod.category,
      description: prod.description,
      price: prod.price,
      salePrice: prod.salePrice || '',
      imageUrl: prod.imageUrl,
      featured: prod.featured,
      sizes: prod.sizes?.map((s) => ({ size: s.size, stockQuantity: s.stockQuantity })) || [
        { size: 8, stockQuantity: 10 },
        { size: 9, stockQuantity: 15 },
      ],
    });
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productsApi.update(editingProduct.id, productForm);
      } else {
        await productsApi.create(productForm);
      }
      setProductModalOpen(false);
      await loadProducts();
      await loadDashboard();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (confirm('Are you sure you want to delete this footwear model from the store?')) {
      try {
        await productsApi.delete(id);
        await loadProducts();
        await loadDashboard();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      await loadOrders();
      await loadDashboard();
      if (selectedOrderDetails?.id === orderId) {
        setSelectedOrderDetails({ ...selectedOrderDetails, status: newStatus });
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-zinc-900 border-r border-zinc-800 p-6 flex flex-col justify-between flex-shrink-0">
        <div className="space-y-8">
          {/* Logo & Admin Pill */}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-2xl tracking-tighter text-white">
                SOLE<span className="text-brand-500">.</span>
              </span>
              <span className="bg-brand-500/20 text-brand-400 border border-brand-500/30 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                ADMIN
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Management Console</p>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'overview'
                  ? 'bg-white text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview & Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'products'
                  ? 'bg-white text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Products & Stock</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'orders'
                  ? 'bg-white text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Order Management</span>
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'customers'
                  ? 'bg-white text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Registered Customers</span>
            </button>
          </nav>
        </div>

        {/* Exit Admin Console */}
        <div className="pt-6 border-t border-zinc-800 space-y-3">
          <div className="text-[11px] text-zinc-400">
            <p className="font-semibold text-zinc-300 truncate">{user?.name}</p>
            <p className="truncate text-zinc-500">{user?.email}</p>
          </div>
          <button
            onClick={onExitAdmin}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <span>Exit to Storefront</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Overview Dashboard</h1>
              <p className="text-xs text-zinc-400 mt-1">
                Real-time metrics and relational data aggregated from Render PostgreSQL
              </p>
            </div>

            {/* KPI Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Total Revenue</span>
                <p className="text-2xl font-black text-white mt-1">
                  {formatINR(dashboardData?.metrics?.totalSales || 0)}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold mt-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Real DB Aggregation</span>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Total Orders</span>
                <p className="text-2xl font-black text-white mt-1">
                  {dashboardData?.metrics?.totalOrders || 0}
                </p>
                <p className="text-[11px] text-zinc-500 mt-2">Placed across store</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Total Footwear</span>
                <p className="text-2xl font-black text-white mt-1">
                  {dashboardData?.metrics?.totalProducts || 0}
                </p>
                <p className="text-[11px] text-zinc-500 mt-2">Active catalogue models</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Registered Users</span>
                <p className="text-2xl font-black text-white mt-1">
                  {dashboardData?.metrics?.totalCustomers || 0}
                </p>
                <p className="text-[11px] text-zinc-500 mt-2">Verified customer accounts</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Revenue Trend Area Chart */}
              <div className="lg:col-span-8 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                  Sales Trend (₹)
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dashboardData?.salesTrend || []}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="date" stroke="#71717a" fontSize={11} />
                      <YAxis stroke="#71717a" fontSize={11} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }}
                        formatter={(val) => [formatINR(val), 'Revenue']}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Orders by Status Breakdown */}
              <div className="lg:col-span-4 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl flex flex-col justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                  Orders by Status
                </h3>
                <div className="h-48 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardData?.statusBreakdown || []}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={4}
                      >
                        {(dashboardData?.statusBreakdown || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-zinc-800 text-xs">
                  {(dashboardData?.statusBreakdown || []).map((sb, idx) => (
                    <div key={sb.status} className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-zinc-400">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                        <span>{sb.status}</span>
                      </span>
                      <span className="font-bold text-white">{sb.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Low Stock Warning Table */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Low Stock Inventory Alerts (Under 8 Units)
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('products')}
                  className="text-xs font-bold text-brand-400 hover:underline"
                >
                  Manage Sizes &rarr;
                </button>
              </div>

              {(!dashboardData?.lowStockItems || dashboardData.lowStockItems.length === 0) ? (
                <p className="text-xs text-zinc-500">All product sizes have healthy inventory levels.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-zinc-300">
                    <thead className="text-[10px] font-bold uppercase text-zinc-500 border-b border-zinc-800 pb-2">
                      <tr>
                        <th className="pb-2">Shoe Model</th>
                        <th className="pb-2">Brand</th>
                        <th className="pb-2">Size</th>
                        <th className="pb-2">Remaining Stock</th>
                        <th className="pb-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {dashboardData.lowStockItems.map((item) => (
                        <tr key={item.id} className="hover:bg-zinc-800/40">
                          <td className="py-2.5 font-bold text-white flex items-center gap-2.5">
                            {item.imageUrl && (
                              <img src={item.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                            )}
                            <span>{item.productName}</span>
                          </td>
                          <td className="py-2.5 text-zinc-400">{item.brand}</td>
                          <td className="py-2.5 font-bold text-zinc-200">Size {item.size}</td>
                          <td className="py-2.5">
                            <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold text-[10px]">
                              {item.stockQuantity} pairs left
                            </span>
                          </td>
                          <td className="py-2.5 text-right">
                            <button
                              onClick={() => {
                                const prod = products.find((p) => p.id === item.productId);
                                if (prod) handleOpenEditProduct(prod);
                                else setActiveTab('products');
                              }}
                              className="text-xs font-bold text-brand-400 hover:underline"
                            >
                              Restock
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PRODUCTS MANAGEMENT TAB */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">Footwear Inventory</h1>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Create, edit, restock sizes, and configure products directly in PostgreSQL
                </p>
              </div>

              <button
                onClick={handleOpenAddProduct}
                className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full flex items-center gap-2 shadow-lg transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Shoe</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative max-w-sm">
              <input
                type="text"
                placeholder="Search products by model, brand, category..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 pl-9 text-xs text-white focus:outline-none focus:border-brand-500"
              />
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5 pointer-events-none" />
            </div>

            {/* Products Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-900/80 text-[10px] font-bold uppercase text-zinc-500 border-b border-zinc-800">
                    <tr>
                      <th className="py-3 px-4">Shoe</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Brand</th>
                      <th className="py-3 px-4">Regular Price</th>
                      <th className="py-3 px-4">Sale Price</th>
                      <th className="py-3 px-4">Sizes & Stock</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {filteredProducts.map((p) => {
                      const totalStock = p.sizes?.reduce((sum, s) => sum + s.stockQuantity, 0) || 0;

                      return (
                        <tr key={p.id} className="hover:bg-zinc-800/40">
                          <td className="py-3 px-4 font-bold text-white flex items-center gap-3">
                            <img
                              src={p.imageUrl}
                              alt=""
                              className="w-10 h-10 rounded-xl object-cover border border-zinc-800"
                            />
                            <div>
                              <span>{p.name}</span>
                              {p.featured && (
                                <span className="ml-2 bg-zinc-800 text-brand-400 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">
                                  Featured
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-zinc-400">{p.category}</td>
                          <td className="py-3 px-4 font-semibold text-zinc-300">{p.brand}</td>
                          <td className="py-3 px-4 font-bold text-white">{formatINR(p.price)}</td>
                          <td className="py-3 px-4">
                            {p.salePrice ? (
                              <span className="text-rose-400 font-bold">{formatINR(p.salePrice)}</span>
                            ) : (
                              <span className="text-zinc-600">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold">{totalStock} pairs</span>
                            <span className="text-zinc-500 text-[10px] block">
                              {p.sizes?.map((s) => `${s.size}:${s.stockQuantity}`).join(' | ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              onClick={() => handleOpenEditProduct(p)}
                              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition"
                              title="Edit Shoe"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-zinc-800 rounded-lg transition"
                              title="Delete Shoe"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ORDERS MANAGEMENT TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">Customer Orders</h1>
                <p className="text-xs text-zinc-400 mt-0.5">
                  View, filter, and transition customer orders through their fulfillment states
                </p>
              </div>

              {/* Status Filter Pills */}
              <div className="flex flex-wrap gap-1.5">
                {['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-full transition ${
                      orderStatusFilter === st
                        ? 'bg-white text-zinc-950'
                        : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-900/80 text-[10px] font-bold uppercase text-zinc-500 border-b border-zinc-800">
                    <tr>
                      <th className="py-3 px-4">Order Reference</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Destination</th>
                      <th className="py-3 px-4">Items</th>
                      <th className="py-3 px-4">Total Amount</th>
                      <th className="py-3 px-4">Current Status</th>
                      <th className="py-3 px-4 text-right">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-zinc-800/40">
                        <td className="py-3 px-4 font-mono font-bold text-white">
                          {o.orderNumber}
                          <span className="text-[10px] text-zinc-500 block font-sans">
                            {new Date(o.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-white">{o.customerName}</p>
                          <p className="text-zinc-500 text-[11px]">{o.phone}</p>
                        </td>
                        <td className="py-3 px-4 text-zinc-400 max-w-xs truncate">
                          {o.city}, {o.state}
                        </td>
                        <td className="py-3 px-4 font-semibold text-zinc-300">
                          {o.orderItems?.length || 0} pair(s)
                        </td>
                        <td className="py-3 px-4 font-black text-white">
                          {formatINR(o.totalAmount)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              o.status === 'Confirmed'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : o.status === 'Shipped'
                                ? 'bg-blue-500/20 text-blue-400'
                                : o.status === 'Delivered'
                                ? 'bg-purple-500/20 text-purple-400'
                                : o.status === 'Cancelled'
                                ? 'bg-rose-500/20 text-rose-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                            className="bg-zinc-800 text-xs text-white rounded-lg px-2.5 py-1 border border-zinc-700 focus:outline-none focus:border-brand-500 cursor-pointer"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CUSTOMERS TAB */}
        {activeTab === 'customers' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Registered Customers</h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                List of registered customer accounts stored in PostgreSQL
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-900/80 text-[10px] font-bold uppercase text-zinc-500 border-b border-zinc-800">
                    <tr>
                      <th className="py-3 px-4">Customer Name</th>
                      <th className="py-3 px-4">Email Address</th>
                      <th className="py-3 px-4">Registration Date</th>
                      <th className="py-3 px-4 text-right">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {customers.map((c) => (
                      <tr key={c.id} className="hover:bg-zinc-800/40">
                        <td className="py-3 px-4 font-bold text-white flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-zinc-800 text-brand-400 font-bold flex items-center justify-center text-xs">
                            {c.name.charAt(0)}
                          </div>
                          <span>{c.name}</span>
                        </td>
                        <td className="py-3 px-4 text-zinc-400">{c.email}</td>
                        <td className="py-3 px-4 text-zinc-500">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="bg-zinc-800 text-zinc-300 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                            Customer
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Product Add / Edit Modal */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            onClick={() => setProductModalOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          <div className="min-h-full flex items-center justify-center p-4">
            <div className="relative bg-zinc-900 text-white rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-zinc-800 shadow-2xl animate-fade-in">
              <button
                onClick={() => setProductModalOpen(false)}
                className="absolute top-5 right-5 text-zinc-400 hover:text-white p-2 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-black tracking-tight mb-4">
                {editingProduct ? 'Edit Footwear Model' : 'Add New Footwear Model'}
              </h2>

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Shoe Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                    placeholder="e.g. Apex Runner X"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                      Brand *
                    </label>
                    <select
                      value={productForm.brand}
                      onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500 cursor-pointer"
                    >
                      <option value="Nike">Nike</option>
                      <option value="Adidas">Adidas</option>
                      <option value="Puma">Puma</option>
                      <option value="New Balance">New Balance</option>
                      <option value="Reebok">Reebok</option>
                      <option value="Salomon">Salomon</option>
                      <option value="Converse">Converse</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                      Category *
                    </label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500 cursor-pointer"
                    >
                      <option value="Running">Running</option>
                      <option value="Casual">Casual</option>
                      <option value="Sports">Sports</option>
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                      placeholder="12999"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                      Sale Price (₹ optional)
                    </label>
                    <input
                      type="number"
                      value={productForm.salePrice}
                      onChange={(e) => setProductForm({ ...productForm, salePrice: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                      placeholder="9999"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Image URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={productForm.imageUrl}
                    onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Description *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                    placeholder="Technical description of cushioning, upper, sole, and usage..."
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={productForm.featured}
                      onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                      className="rounded bg-zinc-800 border-zinc-700 text-brand-500 focus:ring-0"
                    />
                    <span className="font-bold text-zinc-200">Highlight as Featured / Trending</span>
                  </label>
                </div>

                {/* Sizes and stock configuration */}
                <div className="pt-2 border-t border-zinc-800">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Size Inventory (Quantity per Size)
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {productForm.sizes.map((sz, idx) => (
                      <div key={sz.size} className="bg-zinc-800 p-2 rounded-xl text-center">
                        <span className="text-[10px] font-bold text-zinc-400 block">Size {sz.size}</span>
                        <input
                          type="number"
                          min="0"
                          value={sz.stockQuantity}
                          onChange={(e) => {
                            const newSizes = [...productForm.sizes];
                            newSizes[idx].stockQuantity = parseInt(e.target.value, 10) || 0;
                            setProductForm({ ...productForm, sizes: newSizes });
                          }}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded px-1.5 py-1 text-center font-bold text-white text-xs mt-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl uppercase tracking-wider text-xs transition active:scale-95 shadow-md"
                  >
                    {editingProduct ? 'Save Changes' : 'Create Shoe Model'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductModalOpen(false)}
                    className="px-5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-3 rounded-xl uppercase tracking-wider text-xs transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
