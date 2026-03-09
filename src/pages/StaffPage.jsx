// src/pages/StaffPage.jsx
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import './StaffPage.css';

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editStaff, setEditStaff] = useState(null);

  const [form, setForm] = useState({
    name: '',
    role: 'Waiter',
    phone: '',
    salary: '',
    joinDate: '',
  });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('staff') || '[]');
    setStaff(saved);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (staff.length > 0) {
      localStorage.setItem('staff', JSON.stringify(staff));
    }
  }, [staff]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.salary) return alert('Name and Salary are required');

    const member = {
      id: editStaff ? editStaff.id : Date.now(),
      ...form,
      salary: Number(form.salary),
      paidMonths: editStaff?.paidMonths || [],
    };

    if (editStaff) {
      setStaff(staff.map(s => s.id === editStaff.id ? member : s));
      setEditStaff(null);
    } else {
      setStaff([...staff, member]);
    }

    setForm({ name: '', role: 'Waiter', phone: '', salary: '', joinDate: '' });
    setModalOpen(false);
  };

  const handleEdit = (member) => {
    setEditStaff(member);
    setForm({
      name: member.name,
      role: member.role,
      phone: member.phone || '',
      salary: member.salary,
      joinDate: member.joinDate || '',
    });
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this staff member?')) return;
    setStaff(staff.filter(s => s.id !== id));
  };

  const togglePaid = (id) => {
    const monthYear = new Date().toLocaleString('default', { month: 'short', year: 'numeric' });
    setStaff(staff.map(s =>
      s.id === id
        ? {
            ...s,
            paidMonths: s.paidMonths.includes(monthYear)
              ? s.paidMonths.filter(m => m !== monthYear)
              : [...s.paidMonths, monthYear]
          }
        : s
    ));
  };

  const currentMonth = new Date().toLocaleString('default', { month: 'short', year: 'numeric' });

  if (loading) {
    return <div className="staff-loading">Loading staff...</div>;
  }

  return (
    <div className="staff-page-container">
      {/* Header */}
      <div className="staff-header">
        <div>
          <h1 className="staff-title">Staff Management</h1>
          <p className="staff-subtitle">Manage team members, salaries and attendance</p>
        </div>
        <button
          onClick={() => {
            setEditStaff(null);
            setForm({ name: '', role: 'Waiter', phone: '', salary: '', joinDate: '' });
            setModalOpen(true);
          }}
          className="add-staff-btn"
        >
          <Plus size={20} /> Add New Staff
        </button>
      </div>

      {/* Table Wrapper - Fixed width & no bottom line/overflow */}
     {/* Table Wrapper - No overflow-x-auto anymore */}
<div className="staff-table-wrapper">
  <table className="staff-table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Role</th>
        <th>Phone</th>
        <th>Salary (PKR)</th>
        <th>Join Date</th>
        <th>Salary Status ({currentMonth})</th>
        <th className="text-right">Actions</th>
      </tr>
    </thead>
    <tbody>
      {staff.length === 0 ? (
        <tr>
          <td colSpan={7} className="empty-state">
            No staff members added yet.
          </td>
        </tr>
      ) : (
        staff.map((member, index) => (
          <tr 
            key={member.id}
            className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition ${index === staff.length - 1 ? 'last-row' : ''}`}
          >
            <td className="p-4 border-t border-gray-200 dark:border-gray-700">{member.name}</td>
            <td className="p-4 border-t border-gray-200 dark:border-gray-700">{member.role}</td>
            <td className="p-4 border-t border-gray-200 dark:border-gray-700">{member.phone || '—'}</td>
            <td className="p-4 border-t border-gray-200 dark:border-gray-700 font-semibold">{member.salary.toLocaleString()}</td>
            <td className="p-4 border-t border-gray-200 dark:border-gray-700">{member.joinDate || '—'}</td>
            <td className="p-4 border-t border-gray-200 dark:border-gray-700">
              {member.paidMonths?.includes(currentMonth) ? (
                <span className="salary-paid">
                  <CheckCircle size={18} /> Paid
                </span>
              ) : (
                <span className="salary-due">
                  <XCircle size={18} /> Due
                </span>
              )}
            </td>
            <td className="p-4 border-t border-gray-200 dark:border-gray-700 text-right actions-cell">
              <button
                onClick={() => togglePaid(member.id)}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
              >
                {member.paidMonths?.includes(currentMonth) ? 'Mark Unpaid' : 'Mark Paid'}
              </button>
              <button onClick={() => handleEdit(member)} className="text-amber-600 hover:text-amber-800 mr-3">
                <Edit size={18} />
              </button>
              <button onClick={() => handleDelete(member.id)} className="text-red-600 hover:text-red-800">
                <Trash2 size={18} />
              </button>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>

      {/* Modal */}
      {modalOpen && (
        <div className="staff-modal-overlay">
          <div className="staff-modal">
            <h2 className="modal-title">
              {editStaff ? 'Edit Staff Member' : 'Add New Staff'}
            </h2>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label className="modal-label">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="modal-input"
                />
              </div>

              <div className="form-group">
                <label className="modal-label">Role</label>
                <select name="role" value={form.role} onChange={handleChange} className="modal-select">
                  <option value="Waiter">Waiter</option>
                  <option value="Chef">Chef</option>
                  <option value="Manager">Manager</option>
                  <option value="Cashier">Cashier</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="modal-label">Phone Number</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="modal-input" />
              </div>

              <div className="form-group">
                <label className="modal-label">Monthly Salary (PKR) *</label>
                <input
                  type="number"
                  name="salary"
                  value={form.salary}
                  onChange={handleChange}
                  required
                  className="modal-input"
                />
              </div>

              <div className="form-group">
                <label className="modal-label">Join Date</label>
                <input type="date" name="joinDate" value={form.joinDate} onChange={handleChange} className="modal-input" />
              </div>

              <div className="modal-buttons">
                <button type="button" onClick={() => setModalOpen(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  {editStaff ? 'Update Staff' : 'Add Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}