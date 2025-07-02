import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { serverport } from '../../Static/Variables';

function Verify() {
  const [otp, setOtp] = useState('');
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  const navigate = useNavigate();

  const email = localStorage.getItem('pendingEmail');
  const password = localStorage.getItem('pendingPassword');
  const username = localStorage.getItem('pendingUsername');
  const role = localStorage.getItem('pendingRole');

  const [timeLeft, setTimeLeft] = useState(120);
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleVerify = async () => {
    try {
      const url = type === 'signup' ? 'verify-signup-otp' : 'verify-login-otp';
      const payload = type === 'signup'
        ? { email, otp, password, username, role }
        : { email, otp };

      const res = await axios.post(`${serverport}/api/auth/${url}`, payload);

      if (type === 'signup') {
        toast.success("Account verified! You have been logged in.", {
          position: "top-right",
          autoClose: 4000,
        });
        //localStorage.clear();
          // Store user info
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("username", res.data.user.username);
          localStorage.setItem("email", res.data.email);
          localStorage.setItem("has", res.data.user.hasShop);
          localStorage.setItem("id", res.data.user.id);
          localStorage.setItem("user", JSON.stringify(res.data));
  
          // Clear pending
          localStorage.removeItem("pendingEmail");
          localStorage.removeItem("pendingPassword");
 
          // Navigate
          if (res.data.user.role === "customer") {
            navigate("/client");
          } else if (res.data.hasShop === true) {
            navigate("/vendor");
          } else {
            navigate("/vendorform");
          }
      } else {
        toast.success("Login successful!", {
          position: "top-right",
          autoClose: 3000,
        });

        // Store user info
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("username", res.data.username);
        localStorage.setItem("email", res.data.email);
        localStorage.setItem("has", res.data.hasShop);
        localStorage.setItem("id", res.data.id);
        localStorage.setItem("user", JSON.stringify(res.data));

        // Clear pending
        localStorage.removeItem("pendingEmail");
        localStorage.removeItem("pendingPassword");

        // Navigate
        if (res.data.role === "customer") {
          navigate("/client");
        } else if (res.data.hasShop === true) {
          navigate("/vendor");
        } else {
          navigate("/vendorform");
        }
      }
    } catch (err) {
      const msg = err.response?.data?.msg || err.response?.data?.message || "Verification failed";
      toast.error(msg, {
        position: "top-right",
        autoClose: 4000,
      });
    }
  };

  const resendOTP = async () => {
    try {
      await axios.post(`${serverport}/api/auth/resend-otp`, { email });
      toast.info('OTP resent!', {
        position: "top-right",
        autoClose: 3000,
      });
      setTimeLeft(120);
    } catch (err) {
      toast.error('Failed to resend OTP', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Enter OTP</h2>
          
        <input
          type="text"
          value={otp}
          onChange={e => setOtp(e.target.value)}
          placeholder="Enter the 6-digit code"
          maxLength={6}
          className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleVerify}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md mb-3 transition duration-200"
        >
          Verify
        </button>

        <button
          onClick={resendOTP}
          className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-md transition duration-200"
        >
          Resend OTP
        </button>
        <p className="text-center text-sm text-gray-500 mb-4">
          OTP expires in: <span className="font-semibold text-blue-600">{formatTime(timeLeft)}</span>
        </p>
      </div>
    </div>
  );
}

export default Verify;
