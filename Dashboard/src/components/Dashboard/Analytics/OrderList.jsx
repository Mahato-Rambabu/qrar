import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../utils/axiosInstance';

const formatDateTime = (dateString, includeDate = false) => {
  const options = {
    
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: true, // Always include time
    ...(includeDate && { day: '2-digit', month: 'short', year: '2-digit' }), // Conditionally include date
  };
  return new Date(dateString).toLocaleDateString('en-GB', options);
};


const OrderList = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const dateRange = '24h'; // Adjust as needed

        // Fetch served orders
        const servedResponse = await axiosInstance.get(`/orders/history`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { dateRange },
        });

        // Fetch pending orders
        const pendingResponse = await axios.get(`http://localhost:5001/orders/pending`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { dateRange },
        });

        // Merge both served and pending orders
        const mergedOrders = [
          ...servedResponse.data.map((order) => ({ ...order, status: 'Served' })),
          ...pendingResponse.data.map((order) => ({ ...order, status: 'Pending' })),
        ];

        setOrders(mergedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="bg-white shadow-sm rounded-lg border-2 p-6 overflow-x-auto">
      <h3 className="text-2xl font-semibold mb-4 text-gray-700">Last Orders</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-3 px-4 text-gray-600 font-medium text-xs md:text-sm">ID</th>
              <th className="py-3 px-4 text-gray-600 font-medium text-xs md:text-sm">Customer</th>
              <th className="py-3 px-4 text-gray-600 font-medium text-xs md:text-sm">Date</th>
              <th className="py-3 px-4 text-gray-600 font-medium text-xs md:text-sm">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr
                key={index}
                className={`border-t ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}
              >
                <td className="py-3 px-4 text-gray-700 text-xs md:text-sm">{order.orderNo}</td>
                <td className="py-3 px-4 text-gray-700 text-xs md:text-sm">{order.customerName}</td>
                <td className="py-3 px-4 text-gray-700 text-xs md:text-sm">
                  {/* Show full date and time on desktop (md and larger), only date on mobile */}
                  <span className="block md:hidden">
                    {formatDateTime(order.updatedAt || order.createdAt)} {/* Only date on mobile */}
                  </span>
                  <span className="hidden md:block">
                    {formatDateTime(order.updatedAt || order.createdAt, true)} {/* Date and time on PC */}
                  </span>
                </td>
                <td className="py-3 px-4 font-semibold text-gray-700 text-xs md:text-sm">
                  <span
                    className={`px-2 py-1 rounded-lg text-sm ${
                      order.status === 'Served'
                        ? 'bg-green-200 text-green-700'
                        : 'bg-yellow-200 text-yellow-700'
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderList;
