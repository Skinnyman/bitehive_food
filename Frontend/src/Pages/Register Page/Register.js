import React, { useState }  from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import pic from "../../Assets/Sign.jpg";
import Navbar from '../../Components/Navbar';
import { serverport } from '../../Static/Variables';

function Register({darkmode,toggle}) {
  const [error, setError] = useState("");
   
  const [formData,setformData] = useState({username:"",email:"",password:"" ,confirmPassword:"",role:"customer"});
  const navigate = useNavigate();

  const handleSubmit = async (e)=>{
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
       alert("Passwords do not match")

       return
    }

   try{
        const response = await axios.post(`${serverport}/api/auth/register`, formData);
       // navigate("/login");
        console.log("Message:", response.data.msg)
        if (response.data.msg === "User registered successfully"){
          navigate("/login")
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
    <div  className={` ${darkmode ? 'bg-gray-800  text-white':' '}container mx-auto flex flex-col md:flex-row items-center justify-center min-h-screen relative top-36 px-4 py-10 `}>
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
                            <button type='submit' className="relative top-4 w-full py-2 text-black bg-yellow-400 rounded-full font-bold hover:bg-yellow-500 transition">
                              Sign Up
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