import React, { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../../../utils/axiosInstance';
import SummaryCard from './SummaryCard';
import LineGraph from './LineCharts';
import PieChart from './PieCharts';
import ProductList from './ProductList';
import OrderList from './OrderList';
import { useTheme } from '../../../contexxt/ThemeContext';
import { useNavigate } from 'react-router-dom';

const RestoDashboard = () => {
  const { darkMode } = useTheme();
  const [profitData, setProfitData] = useState({ totalProfit: 0, dailyData: [], monthlyData: [] });
  const [totalProducts, setTotalProducts] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [dateRange, setDateRange] = useState('24h');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const [profitResponse, productResponse, orderResponse, usersResponse] = await Promise.all([
          axiosInstance.get(`/orders/total-profit?dateRange=${dateRange}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axiosInstance.get('/products/count', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axiosInstance.get(`/orders/order-count?dateRange=${dateRange}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axiosInstance.get('/users/total-users', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setProfitData(profitResponse.data.data || { totalProfit: 0, dailyData: [], monthlyData: [] });
        setTotalProducts(productResponse.data.totalProducts);
        setOrderCount(orderResponse.data.orderCount);
        setTotalUsers(usersResponse.data.totalUsers);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  const handleDateRangeChange = (event) => {
    setDateRange(event.target.value);
  };

  // Memoize the summaryData to prevent re-rendering unless dateRange changes
  const summaryData = useMemo(() => [
    {
      title: 'Total Profit',
      value: `${profitData.totalProfit.toFixed(2)}`,
      subtitle: `Last ${dateRange}`,
      color: 'bg-white hover:bg-gray-100',
      onClick: () => navigate('/dashboard'),
    },
    {
      title: 'Total Products',
      value: `${totalProducts}`,
      subtitle: 'Total items in our menu',
      color: 'bg-white hover:bg-gray-100',
      onClick: () => navigate('/categories'),
    },
    {
      title: 'Orders',
      value: orderCount,
      subtitle: `Orders in the last ${dateRange}`,
      color: 'bg-white hover:bg-gray-100',
      onClick: () => navigate('/orders'),
    },
    {
      title: 'Total Users',
      value: totalUsers,
      subtitle: 'Registered users',
      color: 'bg-white hover:bg-gray-100',
      onClick: () => navigate('/customers'),
    },
  ], [dateRange, profitData, totalProducts, orderCount, totalUsers]);

  return (
    <div className={`min-h-screen pt-8 p-6 ${darkMode === 'dark' ? 'bg-gray-900 text-gray-200' : 'bg-white text-gray-900'}`}>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="mb-4">
        <select
          id="dateRange"
          value={dateRange}
          onChange={handleDateRangeChange}
          className="p-2 border rounded-lg bg-white shadow-2xl hover:bg-slate-100"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {summaryData.map((data, index) => (
              <SummaryCard key={index} {...data} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 border-2 rounded-lg ">
              <LineGraph />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border-2">
              <h2 className="text-xl font-semibold mb-4 pt-2 px-4">Age Group</h2>
              <PieChart />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="flex flex-col h-full">
              <ProductList dateRange={dateRange} />
            </div>
            <div className="flex flex-col h-full">
              <OrderList />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RestoDashboard;
