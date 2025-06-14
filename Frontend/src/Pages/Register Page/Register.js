import React, { useState }  from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import pic from "../../Assets/Sign.jpg";
import Navbar from '../../Components/Navbar';
import { serverport } from '../../Static/Variables';

function Register({darkmode,toggle}) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
   
  const [formData,setformData] = useState({username:"",email:"",password:"" ,confirmPassword:"",role:"customer"});
  const navigate = useNavigate();

  const handleSubmit = async (e)=>{
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
       alert("Passwords do not match")

       return
    }
    setLoading(true);
   try{
        const response = await axios.post(`${serverport}/api/auth/register`, formData);
       // navigate("/login");
        console.log("Message:", response.data.msg)
        if (response.data.msg === "User registered successfully") {
          const user = response.data.user;
        
          if (user) {
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("token", response.data.token || "dummy-token"); 
            localStorage.setItem("username", user.username);
            localStorage.setItem("has", user.hasShop);
            localStorage.setItem("id", user.id);
        
            if (user.role === "customer") {
              navigate("/client");
            } else if (user.hasShop === true) {
              navigate('/vendor');
            } else {
              navigate("/vendorform");
            }
          }
        }
        

   } catch(err) {
       const errorMsg = err.response.data.msg || "Something went wrong";
          console.log("Registration error",errorMsg);
           setError(errorMsg)
   }
  
  }
  return (
    
        <div>
            <Navbar darkmode={darkmode} toggle={toggle}/>
    <div  className={` ${darkmode ? 'bg-gray-950  text-white':' '}container mx-auto flex flex-col md:flex-row items-center justify-center min-h-[138vh]  relative  px-4 py-10 top-20 `}>
            {/* Left side */}
           <div className="hidden md:block w-full max-w-sm h-[611px] flex-1">
                    <img
                      src={pic}
                      alt="register"
                      className="w-full h-full object-cover rounded-sm shadow-md"
                    />
                  </div>
             {/* Login Form */}
             <div className="border rounded-sm shadow-lg p-10 w-full max-w-md bg-white space-y-6 ">
              <h1 className="text-3xl text-center font-bold text-yellow-300">Register</h1>
              <form onSubmit={handleSubmit}>
                        <div>
                          <label className="block text-yellow-500 font-semibold mb-1">User Name</label>
                          <input
                            type="text"
                            className="w-full p-3 border-b-2 outline-none focus:border-yellow-400 text-gray-700 hover:border-b-yellow-400"
                            onChange={(e) => setformData({ ...formData,username:e.target.value})}
                            required
                            />
                        </div>   
                              <label className="block text-yellow-500 font-semibold mb-1">Email</label>
                              <input
                                type="email"
                                className="w-full p-3 border-b-2 outline-none focus:border-yellow-400 text-gray-700 hover:border-b-yellow-500"
                                onChange={(e) => setformData({ ...formData,email:e.target.value})}
                                 required
                                />
                              <label className="block text-yellow-500 font-semibold mb-1">Password</label>
                              <input
                                type="password"
                                className="w-full p-3 border-b-2 outline-none focus:border-yellow-400 text-gray-700 hover:border-b-yellow-500"
                                onChange={(e) => setformData({ ...formData,password:e.target.value})}
                                required 
                                 minLength="6"
                                />
                              <label className="block text-yellow-500 font-semibold mb-1">Confirm Password</label>
                              <input
                                type="password"    
                                className="w-full p-3 border-b-2 outline-none focus:border-yellow-400 text-gray-700 hover:border-b-yellow-500"
                                onChange={(e) => setformData({ ...formData,confirmPassword:e.target.value})}
                                 minLength="6"
                          
                                />
                                <label className="block text-yellow-500 font-semibold mb-1">Role</label>
                                <select
                              id="role"
                              name="role"
                              required
                              className="input rounded-b-md border w-full p-2"
                              onChange={(e) => setformData({ ...formData,role:e.target.value})}
                              >
                              <option value="customer">Customer</option>
                              <option value="vendor">Vendor</option>
                            </select>
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
                  Signing Up...
                </>
              ) : (
                "Sign Up"
              )}
            </button>
              </form>
              
              {error && <p className='text-red-600'>{error}</p>}
              <div>
                 <p></p>
              </div>
              
             <p>Already have an account ? <Link to={'/login'} className='hover:text-yellow-400'>Sign In</Link></p>
            </div>
          </div>

      </div>
  )
}

export default Register