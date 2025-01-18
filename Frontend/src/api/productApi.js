import axiosInstance from '../utils/axiosInstance';

// Fetch products API call
export const fetchProducts = async (restaurantId, categoryId = 'all') => {
  try {
    const endpoint =
      categoryId === 'all'
        ? `/products/${restaurantId}`
        : `/products/${restaurantId}?categoryId=${categoryId}`;
    const response = await axiosInstance.get(endpoint);

    return response.data; // Return fetched products
  } catch (err) {
    if (!localStorage.getItem('authToken')) {
      console.error('No token available. Please log in first.');
    }
    console.error('Error fetching products:', err.message);
    throw new Error(err.response?.data?.message || 'Failed to fetch products.');
  }
};

// Fetch categories API call
export const fetchCategories = async (restaurantId) => {
  try {
    const response = await axiosInstance.get(`/categories/${restaurantId}`);
    return response.data; // Return fetched categories
  } catch (err) {
    console.error('Error fetching categories:', err.response?.data || err.message);
    throw new Error(err.response?.data?.message || 'Failed to fetch categories.');
  }
};



// Optional: Fetch single product by ID
export const fetchProductById = async (productId) => {
  try {
    const response = await axiosInstance.get(`/products/${productId}`);
    return response.data; // Return the single product data
  } catch (error) {
    if (!localStorage.getItem('authToken')) {
      console.error('No token available. Please log in first.');
    }

    console.error('Error fetching product by ID:', error.message);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch product details. Please try again later.'
    );
  }
};

// Fetch search suggestions API call
export const fetchSearchSuggestions = async (query, restaurantId) => {
  try {
    const response = await axiosInstance.get(
      `/products/search/suggestions?query=${query}&restaurantId=${restaurantId}`
    );
    return response.data.suggestions; 
  } catch (err) {
    console.error('Error fetching search suggestions:', err.response?.data || err.message);
    throw new Error(err.response?.data?.message || 'Failed to fetch suggestions.');
  }
};