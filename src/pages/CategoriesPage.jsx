// client/src/pages/CategoriesPage.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2 } from 'lucide-react';
import './CategoriesPage.css';  // ← یہ لائن رکھو (فائل موجود ہونی چاہیے)

export default function Dashboard({ API, restaurantName = 'Restora' }) {
    const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/categories`);
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('Category name is required!');
      return;
    }

    try {
      if (editingId) {
        await axios.put(`${API}/categories/${editingId}`, form);
        alert('Category updated successfully!');
      } else {
        await axios.post(`${API}/categories`, form);
        alert('Category added successfully!');
      }
      setForm({ name: '' });
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleEdit = (cat) => {
    setForm({ name: cat.name });
    setEditingId(cat._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      await axios.delete(`${API}/categories/${id}`);
      alert('Category deleted!');
      fetchCategories();
    } catch (err) {
      alert('Cannot delete: Maybe items are using this category');
    }
  };

  return (
    <div className="categories-container">
      <h1 className="categories-header">Category Management</h1>

      {/* Form Card */}
      <div className="category-form-card">
        <div className="category-form-inner">
          <h2 className="form-title">
            {editingId ? 'Edit Category' : 'Add New Category'}
          </h2>

          <form onSubmit={handleSubmit} className="category-form">
            <input
              type="text"
              placeholder="Category Name (e.g. Pakistani, Chinese, Desserts)"
              className="category-input"
              value={form.name}
              onChange={(e) => setForm({ name: e.target.value })}
              required
            />

            <div className="form-buttons">
              <button 
                type="submit" 
                className="category-submit-btn"
                disabled={loading}
              >
                {loading ? 'Processing...' : (editingId ? 'Update Category' : 'Add Category')}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setForm({ name: '' });
                    setEditingId(null);
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Categories List */}
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="empty-state">
          No categories yet. Add your first category above!
        </div>
      ) : (
        <div className="categories-list">
          {categories.map((cat) => (
            <div key={cat._id} className="category-card">
              <div className="category-card-inner">
                <h2 className="category-name">{cat.name}</h2>
                
                <div className="category-date">
                  {new Date(cat.createdAt).toLocaleDateString('en-PK')}
                </div>

                <div className="category-actions">
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(cat)}
                  >
                    <Edit size={18} />
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(cat._id)}
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}