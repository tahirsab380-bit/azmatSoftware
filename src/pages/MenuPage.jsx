// client/src/pages/MenuPage.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  X,
  Image as ImageIcon,
  Utensils,
  Loader2
} from 'lucide-react';
import './MenuPage.css';  // ← یہ لائن ضرور رکھو

export default function MenuPage({ API }) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', price: '', category: '', description: '', image: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [menuRes, catRes] = await Promise.all([
        axios.get(`${API}/menu`),
        axios.get(`${API}/categories`)
      ]);
      setItems(menuRes.data);
      setCategories(catRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingId) {
        await axios.put(`${API}/menu/${editingId}`, form);
      } else {
        await axios.post(`${API}/menu`, form);
      }
      setForm({ name: '', price: '', category: '', description: '', image: '' });
      setEditingId(null);
      setShowForm(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setForm({
      name: item.name,
      price: item.price,
      category: item.category?._id || '',
      description: item.description || '',
      image: item.image || ''
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await axios.delete(`${API}/menu/${id}`);
      loadData();
    } catch (error) {
      alert('Failed to delete item');
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || item.category?._id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="menu-container">
        <div className="loading-spinner">
          <Loader2 className="spinner-icon animate-spin" size={48} />
          <h3>Loading Menu</h3>
          <p>Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-container">
      {/* Background Effects */}
      <div className="menu-bg">
        <div className="bg-gradient-1"></div>
        <div className="bg-gradient-2"></div>
        <div className="bg-grid"></div>
      </div>

      {/* Header */}
      <div className="menu-header">
        <div className="header-left">
          <div className="header-badge">
            <Utensils size={20} />
            <span>Menu</span>
          </div>
          <h1 className="header-title">
            Menu <span className="title-highlight">Management</span>
          </h1>
          <div className="header-meta">
            <div className="meta-item">
              Total Items: {items.length}
            </div>
            <div className="meta-item">
              Categories: {categories.length}
            </div>
          </div>
        </div>
        <button 
          className="add-toggle-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Close Form' : 'Add New Item'}
        </button>
      </div>

      {/* Form - Shown when toggled */}
      {showForm && (
        <div className="menu-form-card">
          <div className="form-inner">
            <h2 className="form-title">
              {editingId ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Dish Name *</label>
                  <input
                    type="text"
                    placeholder="Dish Name *"
                    className="form-input"
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Price (PKR) *</label>
                  <input
                    type="number"
                    placeholder="Price (PKR) *"
                    className="form-input"
                    value={form.price}
                    onChange={e => setForm({...form, price: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-select"
                    value={form.category}
                    onChange={e => setForm({...form, category: e.target.value})}
                    required
                  >
                    <option value="">Select Category *</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Image URL (optional)</label>
                  <input
                    type="text"
                    placeholder="Image URL (optional)"
                    className="form-input"
                    value={form.image}
                    onChange={e => setForm({...form, image: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description (optional)</label>
                <textarea
                  placeholder="Description (optional)"
                  className="form-textarea"
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  rows="4"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setForm({ name: '', price: '', category: '', description: '', image: '' });
                    setEditingId(null);
                    setShowForm(false);
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : (editingId ? 'Update Item' : 'Add Item')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="category-filter">
          <Filter size={20} className="filter-icon" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Menu Items Grid */}
      {filteredItems.length > 0 ? (
        <div className="menu-grid">
          {filteredItems.map(item => (
            <div key={item._id} className="menu-card">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="menu-image"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
              <div className="menu-content">
                <h3 className="menu-name">{item.name}</h3>
                <div className="menu-price">Rs. {item.price.toLocaleString('en-PK')}</div>
                
                {item.description && (
                  <p className="menu-description">{item.description}</p>
                )}

                <div className="menu-category">
                  {item.category?.name || 'Uncategorized'}
                </div>

                <div className="menu-actions">
                  <button
                    onClick={() => handleEdit(item)}
                    className="edit-btn"
                  >
                    <Edit size={18} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="delete-btn"
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-items-card">
          <Utensils size={48} className="no-items-icon" />
          <h3 className="no-items-title">No Items Found</h3>
          <p>Click "Add New Item" to create your first menu item</p>
        </div>
      )}
    </div>
  );
}