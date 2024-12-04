import React from 'react';
import { FiSun, FiUser } from 'react-icons/fi';
import { RxHamburgerMenu } from 'react-icons/rx';

const Navbar = ({ toggleSidebar, toggleTheme, title }) => {
  return (
    <div className="fixed h-[8vh] w-full flex items-center justify-between px-4 border-b-2 bg-white z-10">
      <div className="flex gap-2 items-center">
        <RxHamburgerMenu
          size={38}
          className="hover:bg-gray-100 rounded-md hover:rounded-full p-2 cursor-pointer"
          onClick={toggleSidebar}
        />
        <img src="./resto-logo.svg" alt="Logo" className="h-10 w-10" />
        <h1 className="text-xl hidden sm:block">{title}</h1>
      </div>
      <div className="flex gap-6">
        <FiSun
          size={42}
          onClick={toggleTheme}
          className="cursor-pointer hover:bg-gray-100 rounded-md hover:rounded-full p-2"
        />
        <FiUser size={42} className="cursor-pointer hover:bg-gray-100 rounded-md hover:rounded-full p-2" />
      </div>
    </div>
  );
};

export default Navbar;
