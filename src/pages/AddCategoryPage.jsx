// client/src/pages/AddCategoryPage.jsx
import { useState } from 'react';
import axios from 'axios';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AddCategoryPage.css';  // ← یہ لائن ضرور رکھو

export default function Dashboard({ API, restaurantName = 'Restora' }) {  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await axios.post(`${API}/categories`, { name: name.trim() });
      setSuccess(true);
      setName('');
      setTimeout(() => {
        navigate('/categories');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-category-container">
      <div className="add-category-card">
        <div className="card-inner">
          <div className="flex items-center justify-between mb-6">
            <h1 className="page-title">Add New Category</h1>
            <button 
              onClick={() => navigate(-1)}
              className="back-btn"
            >
              <ArrowLeft size={20} /> Back
            </button>
          </div>

          {success && (
            <div className="alert-success">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Category added successfully!</span>
            </div>
          )}

          {error && (
            <div className="alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="category-form">
            <div>
              <label className="form-label">Category Name</label>
              <input
                type="text"
                placeholder="e.g. Pakistani, Chinese, Desserts, Beverages"
                className="category-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading || success}
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={loading || success}
            >
              {loading ? (
                <>
                  <span className="animate-spin">↻</span>
                  Adding...
                </>
              ) : (
                <>
                  <PlusCircle size={20} />
                  Add Category
                </>
              )}
            </button>
          </form>

          <div className="divider">OR</div>

          <button
            onClick={() => navigate('/categories')}
            className="all-categories-btn"
          >
            Go to All Categories
          </button>
        </div>
      </div>
    </div>
  );
}