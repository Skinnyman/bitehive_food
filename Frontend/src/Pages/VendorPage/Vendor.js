import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { FaComments } from "react-icons/fa6";
import Profile from '../Profile page/Profile';
import Product from '../Product Page/Product';
import Order from '../Vendor order page/Order';
import { toast } from 'react-toastify';
import { serverport } from '../../Static/Variables';
import io from "socket.io-client";
import VendorChat from '../Vendor Chat/VendorChat';
const socket = io(serverport);

function Vendor() {
  
    useEffect(() => {
        const vendorId = localStorage.getItem("id"); 
        if (vendorId) {
          socket.emit("registerVendor", vendorId);
        }
        socket.on('newOrder', (data) => {
         // alert(data.message);
          toast.success(data.message,{
            position:"top-right",
            autoClose:9000,
            hideProgressBar:false,
          });
          // Optionally update state to show the order in UI
        });
    
        return () => {
          socket.off('newOrder');
        };
      
      });
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activePage, setActivePage] = useState('Profile');
 const vendorId = localStorage.getItem("id");

  const menuItems = [
    { label: 'Profile', icon: <PersonIcon fontSize="small" /> },
    { label: 'Products', icon: <Inventory2Icon fontSize="small" /> },
    { label: 'Orders', icon: <ShoppingCartIcon fontSize="small" /> },
    { label: 'Chat', icon: <FaComments fontSize="small" /> },
    { label: 'Settings & Preferences', icon: <SettingsIcon fontSize="small" /> },
    { label: 'Support & Help', icon: <HelpOutlineIcon fontSize="small" /> },
    { label: 'Logout', icon: <LogoutIcon fontSize="small" /> },
  ];

  const handleHamburgerClick = () => {
    setIsOpen(!isOpen);
  };

  const renderContent = () => {
    switch (activePage) {
      case 'Profile':
        return <div className="text-xl font-semibold p-4"><Profile /></div>;
      case 'Products':
        return <div className="text-xl font-semibold p-4"><Product/></div>;
      case 'Orders':
        return <div className="text-xl font-semibold p-4"><Order/></div>;
      case 'Chat':
        return <div  className="text-xl font-semibold p-4"><VendorChat vendorId={vendorId}/></div>
      case 'Settings & Preferences':
        return <div className="text-xl font-semibold p-4"><h1>This is setting</h1></div>;
      case 'Support & Help':
        return <div className="text-xl font-semibold p-4"><h1>This is help</h1></div>;
      case 'Logout':
        return null;
      default:
        return null;
    }
  };

  const handleItemClick = (label) => {
    if (label === 'Logout') {
      localStorage.removeItem("token");
      window.location.reload();
      navigate('/login');
    } else {
      setActivePage(label);
      setIsOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white relative">
      {/* Mobile Hamburger */}
      <div className="md:hidden fixed top-4 left-1 z-50">
        <button onClick={handleHamburgerClick}>
          <Bars3Icon className="h-8 w-8 text-gray-700 dark:text-white" />
        </button>
      </div>

      {/* Mobile Sidebar */}
      {isOpen && (
        <aside className="md:hidden fixed top-16 left-0 w-64 h-full bg-gray-100 dark:bg-gray-900 p-4 z-40 shadow-lg">
          <div className="flex justify-end mb-4">
            <button onClick={handleHamburgerClick}>
              <XMarkIcon className="h-6 w-6 text-gray-700 dark:text-white" />
            </button>
          </div>
          <ul className="space-y-4 mt-8">
            {menuItems.map((item) => (
              <li
                key={item.label}
                className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                  activePage === item.label
                    ? 'bg-gray-300 dark:bg-gray-700'
                    : 'hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
                onClick={() => handleItemClick(item.label)}
              >
                {item.icon}
                {item.label}
              </li>
            ))}
          </ul>
        </aside>
      )}

      {/* Fixed Navbar */}
      <div className="z-40 fixed top-0 left-0 w-full flex justify-center border-b-2 p-4 bg-blue-300">
        <h1 className="text-2xl font-bold text-white">BITEHIVE</h1>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-60 bg-gray-200 dark:bg-gray-900 p-4 fixed top-16 left-0 h-full">
          <ul className="space-y-4 mt-8">
            {menuItems.map((item) => (
              <li
                key={item.label}
                className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                  activePage === item.label
                    ? 'bg-gray-300 dark:bg-gray-700'
                    : 'hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
                onClick={() => handleItemClick(item.label)}
              >
                {item.icon}
                {item.label}
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content */}
        <main className="ml-0 md:ml-60 w-full px-4 pt-28 relative">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default Vendor;
