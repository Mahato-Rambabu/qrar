import React, { useEffect, useState } from 'react';
import axios from 'axios'; // For API requests
import { FaCircleChevronRight } from 'react-icons/fa6';

// MenuCategory Component
const MenuCategory = () => {
    const [categories, setCategories] = useState([]); // State for fetched data
    const [loading, setLoading] = useState(true); // State for loading indicator
    const [error, setError] = useState(null); // State for error handling

    // Fetch categories from the API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:5001/674af850d2533b9e24314045/categories'); // Replace with your API endpoint
                setCategories(response.data);
            } catch (err) {
                console.error('Error fetching categories:', err);
                setError('Failed to load categories. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (loading) {
        return <p className="text-center">Loading...</p>;
    }

    if (error) {
        return <p className="text-center text-red-500">{error}</p>;
    }

    return (
        <div className="w-full px-4">
            {/* Menu Heading */}
            <h1 className="text-xl text-center pt-4">Menu</h1>

            {/* Card Container */}
            <div className="w-full grid grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                {categories.map((category) => (
                    <Card key={category.id} image={category.image} name={category.catName} price={category.price} />
                ))}
                <SeeAllCard />
            </div>
        </div>
    );
};

// Card Component
const Card = ({ image, name, price }) => (
    <div className="bg-none rounded-lg p-2 flex flex-col justify-between">
        <img src={image} alt={name} className="w-full h-20 md:h-32 object-cover rounded-md mb-2" />

        <h3 className="text-sm font-medium">{name}</h3>

        <div className="flex justify-between items-center mt-2">
            <p className="text-sm text-gray-500">{price}</p>
            <button className="px-3 py-1 text-pink-500 border border-pink-500 rounded-full text-xs">
                More
            </button>
        </div>
    </div>
);

// See All Card Component
const SeeAllCard = () => (
    <div className="bg-pink-500 rounded-lg shadow-md flex flex-col items-center justify-center mb-2 p-4 cursor-pointer">
        <button className="text-white text-lg font-semibold">See All</button>
        <FaCircleChevronRight size={28} className="text-white mt-2" />
    </div>
);

export default MenuCategory;
