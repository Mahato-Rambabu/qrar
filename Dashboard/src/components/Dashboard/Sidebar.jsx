import React, { useState } from 'react';
import { TbShoppingCartQuestion } from "react-icons/tb";
import { FcFeedback } from "react-icons/fc";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { Link, useLocation } from 'react-router-dom';
import { AiOutlineProduct } from "react-icons/ai";

const Sidebar = ({ isOpen }) => {
  const [isOpenHover, setOpenHover] = useState(false);
  const location = useLocation();

  const handleMouseEnter = () => {
    if (!isOpen) setOpenHover(true);
  };

  const handleMouseLeave = () => {
    if (!isOpen) setOpenHover(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div
      className={`${isOpen || isOpenHover ? 'w-[60%] md:w-[20%]' : 'w-[86px]'
        } h-[100vh] pt-[6vh] flex flex-col items-start`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <ul className="py-6 text-base cursor-pointer w-full">
        <Link to="/dashboard">
          <li
            className={`flex gap-4 items-center px-6 py-4 ${isActive('/dashboard') ? 'bg-green-300 rounded-r-full' : 'hover:bg-green-200 hover:rounded-r-full'
              }`}
          >
            <MdOutlineSpaceDashboard size={18} color='grey' />
            {(isOpen || isOpenHover) && <span className='text-sm'>Dashboard</span>}
          </li>
        </Link>
        <Link to="/products">
          <li
            className={`flex gap-4 items-center px-6 py-4 ${isActive('/products') ? 'bg-green-300 rounded-r-full' : 'hover:bg-green-200 hover:rounded-r-full'
              }`}
          >
            <AiOutlineProduct size={18} color='grey' />
            {(isOpen || isOpenHover) && <span className='text-sm'>Products</span>}
          </li>
        </Link>
        <Link to="/orders">
          <li
            className={`flex gap-4 items-center px-6 py-4 ${isActive('/orders') ? 'bg-green-300 rounded-r-full' : 'hover:bg-green-200 hover:rounded-r-full'
              }`}
          >
            <TbShoppingCartQuestion size={18} color='grey' />
            {(isOpen || isOpenHover) && <span className='text-sm'>Orders</span>}
          </li>
        </Link>
        <Link to="/feedbacks">
          <li
            className={`flex gap-4 items-center px-6 py-4 ${isActive('/feedbacks') ? 'bg-green-300 rounded-r-full' : 'hover:bg-green-200 hover:rounded-r-full'
              }`}
          >
            <FcFeedback size={18} color='grey' />
            {(isOpen || isOpenHover) && <span className='text-sm'>Feedbacks</span>}
          </li>
        </Link>
      </ul>
    </div>
  );
};

export default Sidebar;
