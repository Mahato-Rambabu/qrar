import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
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

  const fetchProfitData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`http://localhost:5001/orders/total-profit?dateRange=${dateRange}`,{
        headers: { Authorization: `Bearer ${token}` },
      });
      const { data } = response.data;

      let formattedData = [];
      if (dateRange === 'week' || dateRange === 'month') {
        formattedData = data.dailyData.map((dayData) => ({
          date: dayData.day,
          profit: dayData.totalProfit,
        }));
      } else if (dateRange === 'year') {
        formattedData = data.monthlyData.map((monthData) => ({
          date: `Month ${monthData.month}`,
          profit: monthData.totalProfit,
        }));
      }

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
      return dayjs(tickItem).format('DD-MMM-YY');
    }
    return tickItem;
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg ">
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
      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={profitData}>
            <Area type="monotone" dataKey="profit" stroke="#8884d8" fill="#8884d8" />
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="date" tickFormatter={formatXAxis} />
            <YAxis tickFormatter={formatYAxis} />
            <Tooltip formatter={(value) => new Intl.NumberFormat().format(value)} />
            <Legend />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default LineGraph;
