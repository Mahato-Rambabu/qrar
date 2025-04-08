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
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        
        // Fetch profit data
        const profitResponse = await axiosInstance.get(`/orders/total-profit?dateRange=${dateRange}`);
        
        if (profitResponse.data && profitResponse.data.data) {
          setProfitData(profitResponse.data.data);
        } else {
          setProfitData({ totalProfit: 0, dailyData: [], monthlyData: [] });
        }
        
        // Fetch product count
        const productResponse = await axiosInstance.get('/products/count');
        setTotalProducts(productResponse.data.totalProducts || 0);
        
        // Fetch order count
        const orderResponse = await axiosInstance.get(`/orders/order-count?dateRange=${dateRange}`);
        setOrderCount(orderResponse.data.orderCount || 0);
        
        // Fetch user count
        const usersResponse = await axiosInstance.get('/users/total-users');
        setTotalUsers(usersResponse.data.totalUsers || 0);
      } catch (error) {
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  const handleDateRangeChange = (event) => {
    setDateRange(event.target.value);
  };

  // Format profit data for the LineGraph component
  const formattedProfitData = useMemo(() => {
    if (!profitData) return [];
    
    if (dateRange === 'week' || dateRange === 'month') {
      if (!profitData.dailyData || !Array.isArray(profitData.dailyData)) {
        console.log('No daily data available in formattedProfitData');
        return [];
      }
      return profitData.dailyData.map(day => ({
        date: day.day,
        profit: day.totalProfit
      }));
    } else if (dateRange === 'year') {
      if (!profitData.monthlyData || !Array.isArray(profitData.monthlyData)) {
        console.log('No monthly data available in formattedProfitData');
        return [];
      }
      return profitData.monthlyData.map(month => ({
        date: `Month ${month.month}`,
        profit: month.totalProfit
      }));
    }
    
    return [];
  }, [profitData, dateRange]);

  // Memoize the summaryData to prevent re-rendering unless dateRange changes
  const summaryData = useMemo(() => [
    {
      title: 'Total Profit',
      value: `₹${profitData.totalProfit ? profitData.totalProfit.toFixed(2) : '0.00'}`,
      subtitle: `Last ${dateRange}`,
      color: 'bg-white hover:bg-gray-100',
      onClick: () => navigate('/'),
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
  ], [dateRange, profitData, totalProducts, orderCount, totalUsers, navigate]);

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

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {summaryData.map((data, index) => (
              <SummaryCard key={index} {...data} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 border-2 rounded-lg ">
              <LineGraph data={formattedProfitData} dateRange={dateRange} />
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
