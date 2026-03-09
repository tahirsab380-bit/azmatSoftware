// src/pages/InventoryPage.jsx
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, PlusCircle, MinusCircle } from 'lucide-react';
import './InventoryPage.css';

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [form, setForm] = useState({
    name: '',
    unit: 'kg',
    currentStock: '',
    minStock: '',
  });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('inventory') || '[]');
    setInventory(saved);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (inventory.length > 0) {
      localStorage.setItem('inventory', JSON.stringify(inventory));
    }
  }, [inventory]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.currentStock) return alert('Name and Current Stock are required');

    const item = {
      id: editItem ? editItem.id : Date.now(),
      ...form,
      currentStock: Number(form.currentStock),
      minStock: Number(form.minStock || 0),
    };

    if (editItem) {
      setInventory(inventory.map(i => i.id === editItem.id ? item : i));
      setEditItem(null);
    } else {
      setInventory([...inventory, item]);
    }

    setForm({ name: '', unit: 'kg', currentStock: '', minStock: '' });
    setModalOpen(false);
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setForm({
      name: item.name,
      unit: item.unit,
      currentStock: item.currentStock,
      minStock: item.minStock,
    });
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this inventory item?')) return;
    setInventory(inventory.filter(i => i.id !== id));
  };

  const updateStock = (id, change) => {
    setInventory(inventory.map(item =>
      item.id === id
        ? { ...item, currentStock: Math.max(0, item.currentStock + change) }
        : item
    ));
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentMonth = new Date().toLocaleString('default', { month: 'short', year: 'numeric' });

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading inventory...</div>;
  }

  return (
    <div className="inventory-page-container">
      {/* Header */}
      <div className="inventory-header">
        <div>
          <h1 className="inventory-title">Inventory Management</h1>
          <p className="inventory-subtitle">Track stock levels and manage ingredients</p>
        </div>
        <button
          onClick={() => {
            setEditItem(null);
            setForm({ name: '', unit: 'kg', currentStock: '', minStock: '' });
            setModalOpen(true);
          }}
          className="add-inventory-btn"
        >
          <Plus size={20} /> Add New Item
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search inventory items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
        />
      </div>

      {/* Table */}
      <div className="inventory-table-wrapper">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Unit</th>
              <th>Current Stock</th>
              <th>Min Stock</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-state">
                  No inventory items found.
                </td>
              </tr>
            ) : (
              filteredInventory.map((item) => {
                const isLowStock = item.currentStock <= item.minStock;
                return (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.unit}</td>
                    <td className="font-semibold">{item.currentStock}</td>
                    <td>{item.minStock}</td>
                    <td>
                      {isLowStock ? (
                        <span className="low-stock">Low Stock ⚠️</span>
                      ) : (
                        <span className="normal-stock">Normal ✅</span>
                      )}
                    </td>
                    <td className="text-right flex items-center justify-end gap-4">
                      <button onClick={() => updateStock(item.id, 1)} className="inventory-action-btn text-green-600">
                        <PlusCircle size={20} />
                      </button>
                      <button onClick={() => updateStock(item.id, -1)} className="inventory-action-btn text-red-600">
                        <MinusCircle size={20} />
                      </button>
                      <button onClick={() => handleEdit(item)} className="inventory-action-btn edit">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="inventory-action-btn delete">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="staff-modal-overlay">
          <div className="staff-modal">
            <h2 className="modal-title">
              {editItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
            </h2>

            <form onSubmit={handleSubmit} className="modal-form">
              <div>
                <label className="modal-label">Item Name *</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} required className="modal-input" />
              </div>

              <div>
                <label className="modal-label">Unit (kg, liter, pcs etc.)</label>
                <input type="text" name="unit" value={form.unit} onChange={handleChange} className="modal-input" />
              </div>

              <div>
                <label className="modal-label">Current Stock *</label>
                <input type="number" name="currentStock" value={form.currentStock} onChange={handleChange} required className="modal-input" />
              </div>

              <div>
                <label className="modal-label">Minimum Stock Level (Alert)</label>
                <input type="number" name="minStock" value={form.minStock} onChange={handleChange} className="modal-input" />
              </div>

              <div className="modal-buttons">
                <button type="button" onClick={() => setModalOpen(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  {editItem ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}