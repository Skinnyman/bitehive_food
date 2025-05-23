import React, { useEffect, useState } from 'react';
import { FaHeart, FaStar } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from 'axios';
import { serverport } from '../Static/Variables';

// Reusable property display
function PropValue({ property, value }) {
  return (
    <div className="flex justify-between w-full text-sm sm:text-base border-b py-2 text-gray-700">
      <span className="font-semibold">{property}</span>
      <span>{value}</span>
    </div>
  );
}

function VendorCard({ buss }) {
  const [isFav, setIsFav] = useState(false);
  const vendorId = buss.userId
  const customerId = localStorage.getItem('id');
  const [ratings, setRatings] = useState({
      averageRating: 0
    });

  useEffect(()=>{
     const checkFavorite = async () =>{
      try{
       const res = await axios.get(`${serverport}/api/vendor/is-favorite?vendorId=${vendorId}&customerId=${customerId}`)
       setIsFav(res.data.isFav)
      } catch(err){
        console.error('Failed to fetch favorite status:',err)
      }
     }
     checkFavorite()
  },[vendorId,customerId])

  const userId = buss.userId

   useEffect(() => {
      axios.get(`${serverport}/api/order/rating?userId=${userId}`)
          .then(res => setRatings({averageRating: res.data.averageRating}) )
          .catch(console.error);      
    }, [userId]);
    //console.log("This is average",ratings.averageRating)

  const handleFavoriteClick = async () => {
    try {
      if (isFav) {
        // Remove favorite
        await axios.post(`${serverport}/api/vendor/unfavorite`, { vendorId, customerId });
        setIsFav(false);
      } else {
        // Add favorite
        await axios.post(`${serverport}/api/vendor/favorite`, { vendorId, customerId });
        setIsFav(true);
      }
    } catch (err) {
      console.error(err);
    }
  };
  

  return (
    <motion.div
      className="w-full sm:w-[350px] p-4 rounded-xl shadow-md border border-gray-200 hover:shadow-lg bg-white hover:bg-blue-50 transition duration-300 ease-in-out mx-auto my-4"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{duration:0.5}}
    >
      <Link to={`/vendor/${buss.userId}`} className="block">
        {/* Title */}
        <div className="text-center text-lg font-bold text-blue-700 mb-3">
          Vendor Info
        </div>

        {/* Vendor Details */}
        <div className="space-y-1 mb-3">
          <PropValue property="Business Name:" value={buss.businessName} />
          <PropValue property="Email:" value={buss.email} />
          <PropValue property="Phone:" value={buss.phone} />
          <PropValue property="Delivery:" value={buss.delivery ? "Yes" : "No"} />
        </div>

        {/* Description */}
        <div className="text-sm mt-2 text-gray-600">
          <div className="font-semibold text-gray-500">Description:</div>
          <p className="mt-1">{buss.description}</p>
        </div>

     
      </Link>
         {/* Footer */}
         <div className="flex justify-between items-center mt-4">
          {/* Favorite */}
          <button
            onClick={handleFavoriteClick}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md border transition ${
              isFav ? "bg-red-100 border-red-300" : "bg-gray-100 border-gray-300"
            } hover:shadow`}
          >
            <FaHeart className={`${isFav ? "text-red-500" : "text-gray-500"}`} />
            <span>{isFav ? "Favorited" : "Add Favorite"}</span>
          </button>

          {/* Rating */}
          <div className="flex items-center gap-2 px-3 py-2 border bg-yellow-50 border-yellow-300 text-yellow-600 text-sm rounded-md">
            <FaStar />
            <span>{ratings.averageRating || 0} Stars</span>
          </div>
        </div>
    </motion.div>
  );
}

export default VendorCard;
