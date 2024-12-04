import React from 'react';
import { GrSearch } from 'react-icons/gr';

const SearchBar = () => {
  return (
    <div className='p-4 flex gap-4 items-center bg-gray-100 rounded-lg h-12 w-[70%] focus-within:bg-white focus-within:shadow-md sm:w-1/2'>
      <GrSearch className='text-gray-500 text-xl hover:rounded-full hover:bg-gray-200 p-2 cursor-pointer' size={40} />
      <input type="text" placeholder='Search' className='outline-none pl-2 bg-gray-100 w-full focus:bg-white' />
    </div>
  );
}

export default SearchBar;
