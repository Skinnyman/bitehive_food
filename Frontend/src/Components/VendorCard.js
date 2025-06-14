import React, { useEffect, useState } from 'react';
import { FaHeart, FaStar, FaComments } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from 'axios';
import { serverport } from '../Static/Variables';
import Chat from './Chat';




function PropValue({ property, value }) {
  return (
    <div className="flex justify-between w-full text-xs sm:text-sm md:text-base border-b py-1 sm:py-2 text-gray-700">
      <span className="font-semibold">{property}</span>
      <span className="break-words max-w-[60%]">{value}</span>
    </div>
  );
}

function VendorCard({ buss, isOnline  }) {

  const [isFav, setIsFav] = useState(false);
  const vendorId = buss.userId;
  const customerId = localStorage.getItem('id');
  const [showchat, setShowChat] = useState(false);
  const [ratings, setRatings] = useState({ averageRating: 0 });

 
  useEffect(() => {
    const checkFavorite = async () => {
      try {
        const res = await axios.get(`${serverport}/api/vendor/is-favorite?vendorId=${vendorId}&customerId=${customerId}`);
        setIsFav(res.data.isFav);
      } catch (err) {
        console.error('Failed to fetch favorite status:', err);
      }
    };
    checkFavorite();
  }, [vendorId, customerId]);

  const userId = buss.userId;

  useEffect(() => {
    axios.get(`${serverport}/api/order/rating?userId=${userId}`)
      .then(res => setRatings({ averageRating: res.data.averageRating }))
      .catch(console.error);
  }, [userId]);

  const handleFavoriteClick = async () => {
    try {
      if (isFav) {
        await axios.post(`${serverport}/api/vendor/unfavorite`, { vendorId, customerId });
        setIsFav(false);
      } else {
        await axios.post(`${serverport}/api/vendor/favorite`, { vendorId, customerId });
        setIsFav(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChat = () => {
    setShowChat(true);
  };
  //console.log("data",isOnline)

  return (
    <motion.div
      className={`w-full max-w-md sm:w-[350px] p-3 sm:p-4 rounded-xl shadow-md border border-gray-200 hover:shadow-lg bg-white hover:bg-blue-50 transition duration-300 ease-in-out mx-auto my-4 relative top-14`}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Link to={`/vendor/${buss.userId}`} className="block">
    <div className="flex justify-between items-center mb-3">
        <div className="text-lg sm:text-xl font-bold text-blue-700 truncate">
          Vendor Info
        </div>
        <div
          className={`w-3 h-3 rounded-full ${
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          }`}
          title={isOnline ? 'Online' : 'Offline'}
        ></div>
     </div>


        <div className="space-y-1 mb-3">
          <PropValue property="Business Name:" value={buss.businessName} />
          <PropValue property="Email:" value={buss.email} />
          <PropValue property="Phone:" value={buss.phone} />
          <PropValue property="Delivery:" value={buss.delivery ? "Yes" : "No"} />
        </div>

        <div className="text-sm sm:text-base mt-2 text-gray-600 break-words">
          <div className="font-bold text-gray-500">Description:</div>
          <p className="mt-1 font-bold">{buss.description}</p>
        </div>
      </Link>

      <div className="flex flex-wrap gap-2 justify-between items-center mt-4">
        <button
          onClick={handleFavoriteClick}
          className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm rounded-md border transition flex-1 min-w-[120px] justify-center ${
            isFav ? "bg-red-100 border-red-300" : "bg-gray-100 border-gray-300"
          } hover:shadow`}
        >
          <FaHeart className={`${isFav ? "text-red-500" : "text-gray-500"}`} />
          <span>{isFav ? "Favorited" : "Add Favorite"}</span>
        </button>

        <div className="flex items-center gap-2 px-3 py-2 border bg-yellow-50 border-yellow-300 text-yellow-600 text-xs sm:text-sm rounded-md flex-1 min-w-[90px] justify-center">
          <FaStar />
          <span>{ratings.averageRating || 0} Stars</span>
        </div>

        <button
          onClick={handleChat}
          className="flex items-center gap-2 border border-blue-400 p-2 text-xs sm:text-sm rounded flex-1 min-w-[90px] justify-center hover:bg-blue-400 hover:text-white"
        >
          <FaComments />
          <span>Chat</span>
        </button>
      </div>

      {showchat && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center px-4"
          onClick={() => setShowChat(false)}
        >
          <div
            className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <Chat vendorId={buss.userId} />
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default VendorCard;
