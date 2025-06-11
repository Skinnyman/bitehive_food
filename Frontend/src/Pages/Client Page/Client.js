import React, { useState ,useEffect} from 'react';
import Navbar from '../../Components/Navbar';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import PersonIcon from '@mui/icons-material/Person';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import Meal from "../Meal Page/Meal"
import Order from "../Order Page/Order"
import VendorInfo from '../VendorInfo/VendorInfo';
import DietPlanner from '../Diet Planner/DietPlanner';
import io from "socket.io-client"
import { serverport } from '../../Static/Variables';
import { toast } from 'react-toastify';
import socket from '../../Static/Socket';
// const socket =io(serverport) 

function Client({ toggle, darkmode }) {
const [onlineVendors, setOnlineVendors] = useState([]);

useEffect(() => {
  
      socket.on('update-online-vendors', (onlineList) => {
        //console.log("Received online vendors list:", onlineList); 
        setOnlineVendors(onlineList);
      });
  
      return () => {
        socket.off('update-online-vendors');
      };
    },[socket]);
    console.log("List",onlineVendors)
  

  useEffect(() => {
          const userId = localStorage.getItem("id"); 
          if (userId) {
            socket.emit("registrationcustomer", userId);
          }
          socket.on('accept', (data) => {
           // alert(data.message);
            toast.success(data.message,{
              position:"top-right",
              autoClose:9000,
              hideProgressBar:false,
            });
            // Optionally update state to show the order in UI
          });
      
          return () => {
            socket.off('accept');
          };
        
        });
  const isLoggedIn = !!localStorage.getItem("token");


  const [isOpen, setIsOpen] = useState(false);
  const [activePage, setActivePage] = useState('Meals');

  const handleHamburgerClick = () => {
    setIsOpen(!isOpen);
  };


  const menuItems = [
    { label: 'Meals', icon: <LocalDiningIcon className="h-6 w-6" /> },
    { label: 'Vendor', icon: <PersonIcon className="h-6 w-6" /> },
    { label: 'Orders', icon: <LocalShippingIcon className="h-6 w-6" /> },
    {label:'Diet Planner', icon: <SmartToyIcon className='h-6 w-6'/>},
  ];

  const renderContent = () => {
    switch (activePage) {
      case 'Meals':
        return (
          <div className="text-xl font-semibold p-4 text-black dark:text-white">
           <Meal  darkmode={darkmode} toggle={toggle}/>
          </div>
        );
      case 'Vendor':
        return (
          <div className="text-xl font-semibold p-4 text-black dark:text-white">
            <VendorInfo onlineVendors={onlineVendors} />
          </div>
        );
      case 'Orders':
        return (
          <div className="text-xl font-semibold p-4 text-black dark:text-white">
            <Order/>
          </div>
        );
        case 'Diet Planner':
          return (
            <div className="text-xl font-semibold p-4 text-black dark:text-white">
                   
                     <DietPlanner/>
          </div>
          )
        
      default:
        return null;
    }
  };

  return (
    <div className={`${darkmode ? 'bg-gray-950 text-white h-16' : ''} `}>
      <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white relative">
        {/* Hamburger Icon */}
        <div className={`md:hidden fixed top-4 left-1 z-50`}>
          <button onClick={handleHamburgerClick}>
            <Bars3Icon className={`h-8 w-8 text-gray-700 dark:text-white ${darkmode ? 'bg-white ' : ''}`} />
          </button>
        </div>

        {/* Mobile Sidebar */}
        {isOpen && (
          <aside className="md:hidden fixed top-0 left-0 w-64 h-full bg-gray-100 dark:bg-gray-900 p-4 z-50 shadow-lg">
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
                  onClick={() => {
                    setActivePage(item.label);
                    setIsOpen(false);
                  }}
                >
                  {item.icon}
                  {item.label}
                </li>
              ))}
            </ul>
          </aside>
        )}

        {/* Navbar */}
        <div className="z-40 relative">
          <Navbar darkmode={darkmode} toggle={toggle} isLoggedIn={isLoggedIn}/>
        </div>

        <div className="flex pt-16">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-60 bg-gray-100 dark:bg-gray-900 p-4 fixed top-16 left-0 h-full">
            <ul className="space-y-4 mt-8">
              {menuItems.map((item) => (
                <li
                  key={item.label}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                    activePage === item.label
                      ? 'bg-gray-300 dark:bg-gray-700'
                      : 'hover:bg-gray-300 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setActivePage(item.label)}
                >
                  {item.icon}
                  {item.label}
                </li>
              ))}
            </ul>
          </aside>

          {/* Main Content */}
          <main className={`${darkmode ? 'bg-white text-white h-full' : ''}ml-0 md:ml-60 w-full px-4 pt-24 relative top-24  min-h-[128vh]`}>
            {renderContent()}
          
          </main>
        </div>
      </div>
    </div>
  );
}

export default Client;
