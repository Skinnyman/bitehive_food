import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar';
import axios from 'axios';
import pic from "../../Assets/Sign.jpg";
import { serverport } from '../../Static/Variables';

function Login({ darkmode, toggle }) {
  const [formData, setformData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const [error, setError] = useState("");


  const handleChange = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(`${serverport}/api/auth/login`, formData);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem('username', response.data.username);
        localStorage.setItem('has', response.data.hasShop);
        localStorage.setItem('id', response.data.id);
        localStorage.setItem("user", JSON.stringify(response.data));

        if (response.data.role === "customer") {
          navigate("/client");
        } else if (response.data.hasShop === true) {
          navigate('/vendor');
        } else {
          navigate("/vendorform");
        }
      }
    } catch (err) {
      const errorMsg = err.response.data.error || "Invalid credentials."
      console.error("login failed:", errorMsg);
      setError(errorMsg);
    }
  };

  return (
    <div>
      <Navbar darkmode={darkmode} toggle={toggle} />
      <div className={`${darkmode ? 'bg-gray-800 text-white' : ''} container mx-auto flex flex-col md:flex-row items-center justify-center min-h-[80vh] px-4 py-8 relative top-36`}>

        {/* Image Section - hidden on mobile */}
        <div className="hidden md:block w-full max-w-sm h-[400px] flex-1">
          <img
            src={pic}
            alt="register"
            className="w-full h-full object-cover rounded-sm shadow-md"
          />
        </div>

        {/* Login Form */}
        <div className="w-full max-w-sm h-[400px] flex-1 bg-white dark:bg-gray-900 border rounded-sm shadow-lg p-6 space-y-4 flex flex-col justify-center">
          <h1 className="text-2xl text-center font-bold text-yellow-300">Login</h1>
          <form onSubmit={handleChange} className="space-y-4">
            <div>
              <label className="block text-yellow-500 font-semibold mb-1">Email</label>
              <input
                type="email"
                placeholder="Enter email..."
                onChange={(e) => setformData({ ...formData, email: e.target.value })}
                required
                className="w-full p-2 border-b-2 outline-none focus:border-yellow-400 text-gray-700 hover:border-b-yellow-400"
              />
            </div>

            <div>
              <label className="block text-yellow-500 font-semibold mb-1">Password</label>
              <input
                type="password"
                placeholder="Enter password..."
                required
                onChange={(e) => setformData({ ...formData, password: e.target.value })}
                className="w-full p-2 border-b-2 outline-none focus:border-yellow-400 text-gray-700 hover:border-b-yellow-500"
              />
            </div>

            <button type="submit" className="w-full py-2 text-white bg-yellow-400 rounded-md font-bold hover:bg-yellow-500 transition">
              Login
            </button>

            {error && <p className="text-red-500 text-center font-semibold">{error}</p>}
          </form>

          <Link to={'/register'} className='hover:text-red-500 text-center text-sm mt-2'>
            Create a new account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
