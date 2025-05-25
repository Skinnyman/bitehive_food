import React,{useState} from 'react';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  MoonIcon,
  UserIcon,
  SunIcon,
} from '@heroicons/react/24/outline';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom';
import { useOrder } from '../context/OrderContext';


function Navbar({ darkmode, toggle,isLoggedIn }) {
const {setOrder} = useOrder()
const [searchTerm,setSearchTerm] = useState("");  
const navigate = useNavigate();
setOrder(searchTerm)
//console.log(order)

const username = localStorage.getItem('username');  

const [profileMenuOpen, setProfileMenuOpen] = useState(false);

const handleProfileClick = () => {
  setProfileMenuOpen(!profileMenuOpen);
};

const handleLogout = () => {
  localStorage.removeItem("token");
  window.location.reload();
  localStorage.removeItem('username')
  navigate("/login")
};
//console.log(username)

  return (
    <header
      className={`fixed bg-gray-100 top-0 left-0 right-0 z-50 ${
        darkmode ? 'bg-[black] text-white' : ''
      } shadow-md border-2`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Link
              to={'/'}
              className="relative left-5 md:left-0 text-3xl font-bold text-accent-500  "
            >
              BiteHive
            </Link>
          </div>

          {/* Search */}
          <div className="flex items-center border rounded-lg px-3 py-1 w-full md:w-1/3">
            <input
              type="text"
              value={searchTerm}
              placeholder="Search for meals"
              onChange={(e)=> setSearchTerm(e.target.value)}
              className={`flex-grow px-2 py-1 outline-none text-sm  ${
                darkmode ? 'bg-black' : 'bg-gray-100'
              }`}
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
          </div>

          {/* Icons and Actions */}
          <div className="flex items-center space-x-4">
            {/* Dark mode toggle */}
            <button
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              onClick={toggle}
            >
              {darkmode ? (
                <SunIcon className="h-6 w-6 text-white hover:text-black" />
              ) : (
                <MoonIcon className="h-6 w-6 text-gray-700" />
              )}
            </button>

          
            {!isLoggedIn && (
  <>
    



            {/* Sign In */}
            <div className='flex gap-2 '>

            <Link
              to="/login"
              className="flex items-center gap-1 px-2 py-1 border-2 border-yellow-500 rounded-md hover:bg-yellow-400 hover:text-white transition"
              >
              <UserIcon className="h-7 w-7" />
              <span className="text-sm font-semibold">Sign In</span>
            </Link>

            {/* Sign Up */}
            <Link
              to="/register"
              className="px-7 py-1 text-sm font-semibold border-2 border-yellow-500 rounded-md hover:bg-yellow-400 hover:text-white transitions"
              >
              Sign Up
            </Link>
            <Link
              to="/register"
              className="px-3 py-1 text-sm font-semibold border-2 border-yellow-500 rounded-md hover:bg-yellow-400 hover:text-white transition"
              >
              Become a vendor
            </Link>
            </div>
           

            </>
)}
      {isLoggedIn && (
              <div className="relative flex">
            <h1 className="text-2xl font-bold ">
                     Welcome, {username}!
            </h1>
                <button onClick={handleProfileClick}>
                  <AccountCircleIcon className="" />
                </button>
                {profileMenuOpen && (
                  <div className="absolute left-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded shadow-lg z-50 top-10">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
               )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
