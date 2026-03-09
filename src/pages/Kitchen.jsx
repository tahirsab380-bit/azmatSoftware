import { useEffect, useState } from "react";
import { io } from "socket.io-client"; // ES module import
import API from "../api/axios";

// 🔹 Connect to Socket.IO server
const socket = io("http://localhost:5000", { transports: ["websocket"] });

function Kitchen() {
  const [orders, setOrders] = useState([]);

  // 🔹 Fetch orders from backend safely
  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders");
      console.log("Orders API Response:", res.data);

      // ✅ Convert to array safely
      const ordersArray = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.orders)
        ? res.data.orders
        : [];

      setOrders(ordersArray.filter((o) => o.status === "Pending"));
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  // 🔹 useEffect for initial fetch + socket listeners
  useEffect(() => {
    fetchOrders();

    // Listen for new order
    socket.on("orderAdded", (order) => {
      setOrders((prev) => [order, ...prev]);
    });

    // Listen for updated order status
    socket.on("orderUpdated", (updated) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === updated._id ? updated : o))
      );
    });

    // Cleanup on unmount
    return () => {
      socket.off("orderAdded");
      socket.off("orderUpdated");
    };
  }, []);

  // 🔹 Mark order as served
  const markServed = async (order) => {
    try {
      const updated = { ...order, status: "Served" };
      await API.put(`/orders/${order._id}`, updated);
      socket.emit("updateOrderStatus", updated);
    } catch (err) {
      console.error("Error updating order:", err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Kitchen Orders</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500">No pending orders</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((o) => (
            <div
              key={o._id}
              className="bg-white p-4 shadow rounded flex flex-col justify-between"
            >
              <div>
                <h2 className="font-bold mb-2">Table {o.tableNumber}</h2>
                <ul className="mb-2">
                  {o.items.map((i) => (
                    <li key={i.productId._id}>
                      {i.productId.name} x{i.quantity}
                    </li>
                  ))}
                </ul>
                <p className="font-semibold">Total: ${o.totalPrice}</p>
              </div>

              <button
                onClick={() => markServed(o)}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white p-2 rounded"
              >
                Mark Served
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Kitchen;