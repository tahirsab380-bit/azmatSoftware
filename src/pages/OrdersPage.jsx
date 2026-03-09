// client/src/pages/OrdersPage.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, Minus, Trash2, Send, Table as TableIcon, ShoppingBag, Clock, CheckCircle,
  XCircle, AlertCircle, Loader2, Search, RefreshCw
} from 'lucide-react';
import './OrdersPage.css';

export default function OrdersPage({ API }) {
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  // Customer form
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadOrdersOnly, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [tablesRes, menuRes, ordersRes] = await Promise.all([
        axios.get(`${API}/tables`).catch(() => ({ data: [] })),
        axios.get(`${API}/menu`).catch(() => ({ data: [] })),
        axios.get(`${API}/orders`).catch(() => ({ data: [] }))
      ]);

      setTables(tablesRes.data || []);
      setMenuItems(menuRes.data || []);
      setOrders(ordersRes.data || []);

      const uniqueCats = ['all', ...new Set(menuRes.data.map(i => i.category?.name).filter(Boolean))];
      setCategories(uniqueCats);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadOrdersOnly = async () => {
    try {
      const res = await axios.get(`${API}/orders`);
      setOrders(res.data || []);
    } catch (err) {
      console.log('Orders refresh failed');
    }
  };

  const addToCart = (item) => {
    if (!selectedTable) return alert('Please select a table first');
    const existing = cart.find(i => i._id === item._id);
    if (existing) {
      setCart(cart.map(i => 
        i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const updateQty = (id, change) => {
    setCart(cart.map(i => {
      if (i._id !== id) return i;
      const newQty = i.quantity + change;
      return newQty > 0 ? { ...i, quantity: newQty } : null;
    }).filter(Boolean));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(i => i._id !== id));
  };

  const handleCustomerChange = (e) => {
    setCustomerForm({ ...customerForm, [e.target.name]: e.target.value });
  };

const placeOrder = async () => {
  if (!selectedTable || cart.length === 0) {
    return alert('Table اور items منتخب کریں');
  }

  if (!customerForm.name || !customerForm.phone) {
    setShowCustomerForm(true);
    return;
  }

  try {
    setPlacingOrder(true);
    const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

    let customerId;

    // Step 1: Customer کو backend میں save/update کرو اور ID حاصل کرو
    const phone = customerForm.phone.trim();

    // موجودہ چیک کرو
    let existingRes;
    try {
      existingRes = await axios.get(`${API}/customers?phone=${encodeURIComponent(phone)}`);
    } catch (e) {
      console.warn('Customer search failed:', e);
    }

    if (existingRes?.data && existingRes.data.length > 0) {
      customerId = existingRes.data[0]._id;
      // اپ ڈیٹ کرو
      await axios.patch(`${API}/customers/${customerId}`, {
        name: customerForm.name.trim(),
        address: customerForm.address?.trim() || 'N/A'
      });
    } else {
      // نیا بناؤ
      const newCustRes = await axios.post(`${API}/customers`, {
        name: customerForm.name.trim(),
        phone,
        address: customerForm.address?.trim() || 'N/A'
      });
      customerId = newCustRes.data._id;
    }

    // Step 2: Order payload — صرف customer ID بھیجو (object نہیں!)
    const orderPayload = {
      table: selectedTable,
      customer: customerId,  // ← صرف ID (string) — یہ کام کرے گا
      items: cart.map(i => ({
        menuItem: i._id,
        name: i.name,
        price: i.price,
        quantity: i.quantity
      })),
      total,
      status: 'pending'
    };

    console.log('Sending correct order payload:', orderPayload);

    await axios.post(`${API}/orders`, orderPayload);

    // Stock کم کرو (اختیاری)
    setMenuItems(menuItems.map(item => {
      const ordered = cart.find(c => c._id === item._id);
      return ordered ? { ...item, currentStock: item.currentStock - ordered.quantity } : item;
    }));

    setCart([]);
    setSelectedTable(null);
    setCustomerForm({ name: '', phone: '', address: '' });
    setShowCustomerForm(false);
    await loadOrdersOnly();

    alert(`Order placed successfully for ${customerForm.name}!`);
  } catch (err) {
    console.error('Order failed:', err.response?.data || err);
    const msg = err.response?.data?.message || err.message || 'Unknown error';
    alert(`Order نہ ہو سکا: ${msg}`);
  } finally {
    setPlacingOrder(false);
  }
};

  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const allCategories = ['all', ...new Set(menuItems.map(i => i.category?.name).filter(Boolean))];

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Loader2 className="animate-spin text-amber-600" size={48} />
      </div>
    );
  }

  return (
    <div className="orders-page-container">
      {/* Header */}
      <div className="orders-header">
        <h1 className="orders-title">Orders & POS</h1>
        <button className="refresh-btn" onClick={loadData}>
          <RefreshCw size={18} /> Refresh
        </button>
      </div>

      {/* Main Grid */}
      <div className="orders-grid">
        {/* Left: Table Selection */}
        <div className="orders-left">
          <div className="section-card">
            <h2 className="section-title">Select Table</h2>
            <div className="tables-grid">
              {tables.map(table => (
                <button
                  key={table._id}
                  className={`table-btn ${selectedTable === table._id ? 'active' : ''}`}
                  onClick={() => setSelectedTable(table._id)}
                >
                  Table {table.tableNumber}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Middle: Menu */}
        <div className="orders-middle">
          <div className="section-card">
            <h2 className="section-title">Menu Items</h2>

            <div className="menu-filters">
              <div className="search-box">
                <Search size={20} />
                <input
                  placeholder="Search menu..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="menu-search"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="category-select"
              >
                {allCategories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="menu-grid">
              {filteredMenuItems.map(item => (
                <div key={item._id} className="menu-card">
                  <h3 className="menu-name">{item.name}</h3>
                  <p className="menu-price">Rs. {item.price?.toLocaleString() || 'N/A'}</p>
                  <p className="menu-stock">Stock: {item.currentStock}</p>
                  <button
                    onClick={() => addToCart(item)}
                    disabled={item.currentStock <= 0 || !selectedTable}
                    className={`add-to-cart-btn ${item.currentStock <= 0 ? 'disabled' : ''}`}
                  >
                    <Plus size={18} /> Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Cart */}
        <div className="orders-right">
          <div className="cart-card">
            <h2 className="cart-title">Current Order</h2>

            {cart.length === 0 ? (
              <div className="empty-cart">
                <ShoppingBag size={48} />
                <p>Cart is empty</p>
                <p>Select table first</p>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map(item => (
                    <div key={item._id} className="cart-item">
                      <div className="cart-item-info">
                        <span className="cart-item-name">{item.name}</span>
                        <span className="cart-item-price">Rs. {item.price} × {item.quantity}</span>
                      </div>
                      <div className="cart-qty">
                        <button onClick={() => updateQty(item._id, -1)}><Minus size={16} /></button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQty(item._id, 1)}><Plus size={16} /></button>
                      </div>
                      <button onClick={() => removeFromCart(item._id)} className="remove-cart">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="cart-summary">
                  <div className="cart-total">
                    <span>Total:</span>
                    <span>Rs. {cartTotal.toLocaleString()}</span>
                  </div>

                  <button 
                    onClick={placeOrder}
                    disabled={placingOrder || cart.length === 0}
                    className="place-order-btn"
                  >
                    {placingOrder ? 'Placing...' : 'Place Order'}
                  </button>
                </div>
              </>
            )}

            {/* Customer Form Popup */}
            {showCustomerForm && (
              <div className="customer-form-overlay">
                <div className="customer-form">
                  <h3 className="form-title">Customer Details</h3>
                  <p className="form-subtitle">Please enter customer info to complete the order</p>

                  <div className="form-group">
                    <label className="form-label">Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={customerForm.name}
                      onChange={handleCustomerChange}
                      required
                      className="form-input"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={customerForm.phone}
                      onChange={handleCustomerChange}
                      required
                      className="form-input"
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Address (optional)</label>
                    <input
                      type="text"
                      name="address"
                      value={customerForm.address}
                      onChange={handleCustomerChange}
                      className="form-input"
                      placeholder="Delivery address if needed"
                    />
                  </div>

                  <div className="form-buttons">
                    <button 
                      onClick={() => setShowCustomerForm(false)} 
                      className="cancel-btn"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={placeOrder}
                      disabled={!customerForm.name || !customerForm.phone || placingOrder}
                      className="save-btn"
                    >
                      {placingOrder ? 'Placing Order...' : 'Confirm & Place Order'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}