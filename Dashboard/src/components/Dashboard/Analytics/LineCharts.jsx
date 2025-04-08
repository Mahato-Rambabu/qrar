import React, { useEffect, useState, useCallback } from 'react';
import axiosInstance from '../../../utils/axiosInstance';
import {
  AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import dayjs from 'dayjs';

// Function to generate a range of dates between start and end
const generateDateRange = (startDate, endDate) => {
  let currentDate = dayjs(startDate);
  const dates = [];

  while (currentDate.isBefore(dayjs(endDate)) || currentDate.isSame(dayjs(endDate))) {
    dates.push(currentDate.format('YYYY-MM-DD'));
    currentDate = currentDate.add(1, 'day');
  }

  return dates;
};

// Function to merge full date range with profit data
const mergeDataWithFullDateRange = (fullDateRange, profitData) => {
  const profitDataMap = profitData.reduce((map, item) => {
    map[item.date] = item.profit;
    return map;
  }, {});

  return fullDateRange.map(date => ({
    date,
    profit: profitDataMap[date] || 0,
  }));
};

const LineGraph = () => {
  const [profitData, setProfitData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('week'); // Default to 'week'
  const [error, setError] = useState(null);

  const fetchProfitData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(`Fetching profit data for date range: ${dateRange}`);
      const response = await axiosInstance.get(`orders/total-profit?dateRange=${dateRange}`);
      console.log('Profit data response:', response.data);
      
      if (!response.data || !response.data.data) {
        throw new Error('Invalid response format from API');
      }
      
      const { data } = response.data;
      
      let formattedData = [];
      if (dateRange === 'week' || dateRange === 'month') {
        if (data.dailyData && Array.isArray(data.dailyData)) {
          formattedData = data.dailyData.map((dayData) => ({
            date: dayData.day,
            profit: dayData.totalProfit,
          }));
        } else {
          console.log('No daily data available:', data.dailyData);
          formattedData = [];
        }
      } else if (dateRange === 'year') {
        if (data.monthlyData && Array.isArray(data.monthlyData)) {
          formattedData = data.monthlyData.map((monthData) => ({
            date: `Month ${monthData.month}`,
            profit: monthData.totalProfit,
          }));
        } else {
          console.log('No monthly data available:', data.monthlyData);
          formattedData = [];
        }
      }

      // For year view, we don't need to merge with a full date range
      if (dateRange === 'year') {
        setProfitData(formattedData);
        setLoading(false);
        return;
      }

      // For week and month views, merge with a full date range
      let fullDateRange;
      if (dateRange === 'week') {
        fullDateRange = generateDateRange(dayjs().subtract(7, 'days').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD'));
      } else if (dateRange === 'month') {
        fullDateRange = generateDateRange(dayjs().subtract(30, 'days').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD'));
      }

      const mergedData = mergeDataWithFullDateRange(fullDateRange, formattedData);
      setProfitData(mergedData);
    } catch (error) {
      console.error('Error fetching profit data:', error);
      setError('Failed to load profit data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    if (dateRange !== '24h') { // Skip fetching data for '24h'
      fetchProfitData();
    }
  }, [dateRange, fetchProfitData]);

  const handleDateRangeChange = (e) => {
    setDateRange(e.target.value);
  };

  const formatYAxis = (value) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value;
  };

  const formatXAxis = (tickItem) => {
    if (dayjs(tickItem, 'YYYY-MM-DD', true).isValid()) {
      return dayjs(tickItem).format('DD-MM-YYYY');
    }
    return tickItem;
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-700">Sales</h2>
        <select
          id="dateRange"
          value={dateRange}
          onChange={handleDateRangeChange}
          className="p-2 border rounded-lg bg-white hover:bg-slate-100"
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
        </select>
      </div>
      
      {error && (
        <div className="text-red-500 mb-4">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : profitData.length === 0 ? (
        <div className="flex justify-center items-center h-64 text-gray-500">
          No sales data available for the selected period
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={profitData}>
            <defs>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="profit" 
              stroke="#8884d8" 
              fillOpacity={1} 
              fill="url(#colorProfit)" 
            />
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={formatXAxis} />
            <YAxis tickFormatter={formatYAxis} />
            <Tooltip 
              formatter={(value) => `₹${new Intl.NumberFormat().format(value)}`} 
              labelFormatter={(label) => dayjs(label).format('DD-MM-YYYY')}
            />
            <Legend />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default LineGraph;
