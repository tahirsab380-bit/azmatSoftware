// client/src/pages/BillsPage.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import './BillsPage.css';

export default function BillsPage({ API, restaurantName = 'Restora' }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState(null);

  const fetchPaidOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/orders`);
      const paidOrders = res.data.filter(order => order.status === 'paid');
      console.log('Fetched paid orders:', paidOrders); // ← یہ کنسول میں چیک کرو کہ customer فیلڈ ہے یا نہیں
      setOrders(paidOrders);
    } catch (err) {
      console.error('Error fetching bills:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaidOrders();
    const intervalId = setInterval(fetchPaidOrders, 15000);
    return () => clearInterval(intervalId);
  }, [API]);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-PK', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const printSelectedBill = (order) => {
    setSelectedBill(order);
    setTimeout(() => {
      window.print();
      setTimeout(() => setSelectedBill(null), 500);
    }, 300);
  };

  if (loading) {
    return <div className="bills-loading">Loading bills...</div>;
  }

  return (
    <div className="bills-container">
      <h1 className="bills-header">{restaurantName} - Bills & Order History</h1>

      <div className="table-wrapper">
        <table className="bills-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Table</th>
              <th>Customer Name</th>
              <th>Phone</th>
              <th>Items</th>
              <th>Total</th>
              <th>Print</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-state-td">
                  No completed (paid) orders yet.
                </td>
              </tr>
            ) : (
              orders.map(order => (
                <tr key={order._id}>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>Table {order.table?.tableNumber || 'N/A'}</td>
                  <td>
                    <strong>
                      {order.customer?.name || 'Unknown Customer'}
                    </strong>
                  </td>
                  <td>
                    {order.customer?.phone || 'N/A'}
                  </td>
                  <td>{order.items.map(i => `${i.name} × ${i.quantity}`).join(', ')}</td>
                  <td className="total-amount">Rs. {order.total.toLocaleString('en-PK')}</td>
                  <td>
                    <button 
                      onClick={() => printSelectedBill(order)}
                      className="print-single-btn"
                    >
                      Print Bill
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Print Preview - Only the exact customer who ordered */}
      {selectedBill && (
        <div className="print-preview">
          <div className="bill-document">
            <div className="bill-header">
              <h1 className="restaurant-name">{restaurantName}</h1>
              <p className="bill-tagline">Thank you for dining with us!</p>
              <div className="bill-info">
                <p><strong>Bill No:</strong> #{selectedBill._id.slice(-8)}</p>
                <p><strong>Date:</strong> {formatDate(selectedBill.createdAt)}</p>
                <p><strong>Table:</strong> {selectedBill.table?.tableNumber || 'N/A'}</p>
              </div>
            </div>

            {/* Customer Details */}
            <div className="bill-customer-section">
              <h3>Customer Details</h3>
              <p><strong>Name:</strong> {selectedBill.customer?.name || 'Unknown Customer'}</p>
              <p><strong>Phone:</strong> {selectedBill.customer?.phone || 'N/A'}</p>
              <p><strong>Address:</strong> {selectedBill.customer?.address || 'N/A'}</p>
            </div>

            <table className="bill-items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {selectedBill.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>Rs. {item.price.toLocaleString('en-PK')}</td>
                    <td>Rs. {(item.price * item.quantity).toLocaleString('en-PK')}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="bill-summary">
              <div className="grand-total">
                <span>Grand Total:</span>
                <span className="total-value">Rs. {selectedBill.total.toLocaleString('en-PK')}</span>
              </div>
            </div>

            <div className="bill-footer">
              <p>Payment Method: Cash / Card / Mobile</p>
              <p>Thank You! Please Come Again</p>
              <p>{restaurantName} • Lahore, Pakistan</p>
              <p>Printed on: {new Date().toLocaleString('en-PK')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}