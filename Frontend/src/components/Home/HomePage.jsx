import React from 'react';
import { IoCartSharp } from 'react-icons/io5';
import SearchBar from './SearchBar';
import ImageSlider from './ImageSlider';
import MenuCategory from './MenuCategory';

const HomePage = () => {
  return (
    <div className="h-screen w-full relative">

      <nav className="w-full h-[10%] flex justify-around items-center">
        <SearchBar />
        <div className="flex items-center">
          <img src="/logo.png" alt="Restaurant logo" className="w-12 h-12 rounded-full" />
        </div>
      </nav>

      <div className="h-[40%] w-full bg-white rounded-b-[15%] overflow-hidden">
        <ImageSlider />
      </div>

      <div className="w-full flex items-center justify-center">
        <MenuCategory />
      </div>

      <div className="fixed bottom-8 right-8 md:bottom-16 md:right-16 bg-white rounded-full p-3 shadow-lg cursor-pointer">
        <IoCartSharp className="text-pink-500 text-3xl" />
      </div>
    </div>
  );
};

export default HomePage;
