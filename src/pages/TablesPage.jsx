// client/src/pages/TablesPage.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle } from 'lucide-react';
import './TablesPage.css';  // ← یہ لائن ضرور رکھو

export default function TablesPage({ API }) {
  const [tables, setTables] = useState([]);
  const [form, setForm] = useState({ tableNumber: '', capacity: 4 });

  useEffect(() => {
    axios.get(`${API}/tables`).then(res => setTables(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post(`${API}/tables`, form);
    setForm({ tableNumber: '', capacity: 4 });
    const res = await axios.get(`${API}/tables`);
    setTables(res.data);
  };

  return (
    <div className="tables-container">
      <h1 className="tables-header">Table Management</h1>

      {/* Form Card */}
      <div className="table-form-card">
        <div className="form-inner">
          <h2 className="form-title">Add New Table</h2>
          <form onSubmit={handleSubmit} className="flex flex-wrap gap-4">
            <input
              type="number"
              placeholder="Table Number"
              className="table-input"
              value={form.tableNumber}
              onChange={e => setForm({...form, tableNumber: e.target.value})}
              min="1"
              required
            />
            <input
              type="number"
              placeholder="Capacity"
              className="table-input"
              value={form.capacity}
              onChange={e => setForm({...form, capacity: e.target.value})}
              min="1"
              required
            />
            <button type="submit" className="add-table-btn">
              <PlusCircle size={20} />
              Add Table
            </button>
          </form>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="tables-grid">
        {tables.map(table => (
          <div
            key={table._id}
            className={`table-card ${table.status === 'occupied' ? 'occupied' : 'available'}`}
          >
            <h2 className="table-number">Table {table.tableNumber}</h2>
            <p className="table-capacity">Capacity: {table.capacity}</p>
            <div className={`table-status ${table.status}`}>
              {table.status.toUpperCase()}
            </div>
          </div>
        ))}
      </div>

      {tables.length === 0 && (
        <div className="empty-state">
          No tables created yet.
        </div>
      )}
    </div>
  );
}