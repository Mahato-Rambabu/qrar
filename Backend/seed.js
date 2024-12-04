import mongoose from 'mongoose';
import { deleteMany, insertMany } from './models/qrar';
import { config } from 'dotenv';

config();

// Sample product data
const products = [
  { name: "Product 1", price: "₹110", image: "/CategoryImages/cfood1.jpg" },
  { name: "Product 2", price: "₹35", image: "/CategoryImages/cfood4.jpg" },
  { name: "Product 3", price: "₹148", image: "/CategoryImages/cfood5.jpg" },
  { name: "Product 4", price: "₹35", image: "/CategoryImages/cfood1.jpg" },
  { name: "Product 5", price: "₹36", image: "/CategoryImages/cfood4.jpg" },
   { name: "Product 5", price: "₹36", image: "/CategoryImages/cfood4.jpg" },
];

const seedDatabase = async () => {
  try {
    // Clear existing data
    await deleteMany();

    // Insert new data
    await insertMany(products);
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    throw error; // Allow error to propagate
  }
};

export default seedDatabase;
