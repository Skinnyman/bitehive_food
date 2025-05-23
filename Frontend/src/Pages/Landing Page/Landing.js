import React from 'react';
import Navbar from '../../Components/Navbar';
import { Link } from 'react-router-dom';
import pic from "../../Assets/MainBg.jpg";

function Landing({ darkmode, toggle }) {
  return (
    <div>
      <Navbar darkmode={darkmode} toggle={toggle} />
      <div className={`${darkmode ? 'bg-gray-900 text-black' : 'bg-white text-gray-900'} min-h-screen`}>
        {/* Main Hero Section with Background Image */}
        <div
          className="relative h-screen bg-cover bg-center"
          style={{ backgroundImage: `url(${pic})` }}
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>

          {/* Main Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 sm:pt-48 text-white text-center top-14">
            <h1 className={`text-4xl font-extrabold sm:text-5xl lg:text-6xl`}>
              Welcome to <span className="text-accent-500">BiteHive</span>
            </h1>
            <p className="mt-6 max-w-xl mx-auto text-lg sm:text-xl text-gray-200">
              Your campus food ordering platform. Order delicious meals from your favorite vendors.
            </p>
            <p className="mt-4 text-lg font-medium text-gray-300">
              Enjoy fast, secure, and AI-powered meal ordering!
            </p>

            {/* Buttons */}
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                to="/login"
                className="px-6 py-3 text-lg font-semibold bg-gray-700 dark:bg-gray-300 text-white dark:text-black rounded-lg transition duration-300 hover:bg-gray-600 dark:hover:bg-gray-400 shadow-md"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-6 py-3 text-lg font-semibold bg-accent-500 text-white rounded-lg transition duration-300 hover:bg-accent-600 shadow-md"
              >
                Register
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-12 rounded-xl shadow-lg bg-gray-100 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-accent-600 font-semibold tracking-wide uppercase">Features</h2>
              <p className="mt-2 text-3xl font-extrabold sm:text-4xl">
                A better way to order campus food
              </p>
            </div>

            {/* Feature Grid */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-8">
              {[
                { title: 'Smart Meal Planning', desc: 'AI-powered meal suggestions based on your preferences.' },
                { title: 'Real-time Order Tracking', desc: 'Track your order status in real-time.' },
                { title: 'Secure Payments', desc: 'Safe and secure payment processing with multiple options.' },
                { title: 'Vendor Dashboard', desc: 'Manage orders and menu items easily.' }
              ].map((feature) => (
                <div key={feature.title} className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
                  <h3 className="text-2xl font-bold">{feature.title}</h3>
                  <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;
