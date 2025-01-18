import axios from 'axios';

const parseQuery = (queryString) => {
  const params = new URLSearchParams(queryString);
  return {
    restaurantId: params.get('restaurantId'),
    token: params.get('token'),
  };
};

export const fetchRestaurantData = async () => {
  const { restaurantId, token } = parseQuery(window.location.search);

  try {
    const response = await axios.get(`/api/restaurants/frontend/${restaurantId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data; // Restaurant data
  } catch (error) {
    console.error('Error fetching restaurant data:', error);
    throw new Error('Failed to fetch restaurant data.');
  }
};
