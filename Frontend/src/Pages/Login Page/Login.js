import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar';
import axios from 'axios';
import pic from "../../Assets/Sign.jpg";
import { serverport } from '../../Static/Variables';

function Login({ darkmode, toggle }) {
  const [formData, setformData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false); // <-- Loading state
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleChange = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true); // Start loading

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
      const errorMsg = err.response?.data?.error || "Invalid credentials.";
      console.error("login failed:", errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div>
      <Navbar darkmode={darkmode} toggle={toggle} />
      <div className={`${darkmode ? 'bg-gray-950 text-white h-16' : ''} container mx-auto flex flex-col md:flex-row items-center justify-center min-h-[128vh] px-4 py-8 relative top-16`}>

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

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 text-white rounded-md font-bold transition flex justify-center items-center gap-2
                ${loading ? 'bg-yellow-300 cursor-not-allowed' : 'bg-yellow-400 hover:bg-yellow-500'}
              `}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
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
