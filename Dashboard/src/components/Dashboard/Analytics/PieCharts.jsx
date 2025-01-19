import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../utils/axiosInstance';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658'];

const CustomPieChart = () => {
  const [ageGroupData, setAgeGroupData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgeGroupData = async () => {
      try {
        const response = await axiosInstance.get('/users/users-by-age-group',{
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        });
        const data = Object.entries(response.data).map(([key, value]) => ({
          name: key,
          value,
        }));
        setAgeGroupData(data);
      } catch (error) {
        console.error('Error fetching age group data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgeGroupData();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 ">
      {/* <h3 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Users by Age Group</h3> */}
      {loading ? (
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={ageGroupData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {ageGroupData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default CustomPieChart;
