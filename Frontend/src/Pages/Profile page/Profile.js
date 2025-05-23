import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { serverport } from '../../Static/Variables';

function Profile() {
  const [business, setBusiness] = useState([]);
  const [info,setInfo] = useState([])
  const [fav,setFav] = useState([])
  const [stats, setStats] = useState({
    dailyOrders: 0,
    weeklyOrders: 0,
  });
  const [ratings, setRatings] = useState({
    "1": 0, "2": 0, "3": 0, "4-5": 0,
    averageRating: 0
  });
 
 const userId = localStorage.getItem('id');
 // get the business information of the vendor
  useEffect(() => {
    axios
      .get(`${serverport}/api/vendor/business?userId=${userId}`)
      .then((res) => setBusiness(res.data))
      .catch((err) => console.log(err));
  }, [userId]);

// get total orders,pending orders,cancelled orders,potential earnings and total earning
  useEffect(() =>{  
    axios
    .get(`${serverport}/api/vendor/orderinfo?userId=${userId}`)
    .then((res) => setInfo(res.data))
    .catch((err) => console.log(err));
  },[userId])
  //console.log(info)
  //gets the number of client that made the vendor favorite
  const vendorId = localStorage.getItem('id');
  useEffect(() =>{  
    axios
    .get(`${serverport}/api/vendor/getfavorite?vendorId=${vendorId}`)
    .then((res) => setFav(res.data))
    .catch((err) => console.log(err));
  },[vendorId])

//Getting daily orders and weekly orders
  useEffect(() => {
    axios.get(`${serverport}/api/order/orders-stats?userId=${userId}`)
      .then(res => setStats(res.data))
      .catch(console.error);
  }, [userId]);
 // console.log("Come",stats)
 // gets average rating and number of rating
  useEffect(() => {
    axios.get(`${serverport}/api/order/rating?userId=${userId}`)
        .then(res => setRatings({ ...res.data.ratingSummary,
          averageRating: res.data.averageRating}) )
        .catch(console.error);      
  }, [userId]);
  //console.log("This is rating",ratings)
  

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Business Info Section */}
        <div className="bg-white p-6 rounded-xl shadow-md w-full lg:w-2/3">
          <div className="flex items-center mb-4">
            <h2 className="ml-3 text-xl font-bold bg-cyan-500 text-white rounded p-1">Business Information</h2>
          </div>
          <hr className='bg-cyan-500'/>

          <div key={business.userId} className="space-y-4">
            <div>
              <label className="block font-medium">Business Name</label>
              <p className="text-gray-600 font-bold">{business.businessName}</p>
            </div>

            <div>
              <label className="block font-medium ">Business Contact</label>
              <p className="text-gray-600 font-bold">{business.phone}</p>
            </div>

            <div>
              <label className="block font-medium">Business Email</label>
              <p className="text-gray-600 font-bold">{business.email}</p>
            </div>

            <div>
              <button className="w-full bg-white border shadow-sm py-2 rounded-md hover:bg-gray-50 transition">
                Pick location
              </button>
            </div>

            <div>
              <label className="block font-medium">Makes Delivery</label>
              <p className="text-gray-600 font-bold">{business.delivery}</p>
            </div>

            <div>
              <label className="block font-medium">Description</label>
              <p className="text-gray-600 font-bold">{business.description}</p>
            </div>
          </div>
        </div>

        {/* Orders Info Section */}
        <div className="bg-white p-6 rounded-xl shadow-md w-full lg:w-1/3">
          <div className="flex items-center mb-4">
            <h2 className="ml-3 text-xl font-bold bg-cyan-500 text-white rounded p-1">Orders Information</h2>
          </div>
          <hr className='bg-cyan-500'/>


          <ul className="space-y-3 text-gray-700 font-medium">
            <li className='flex justify-between'>Completed Orders<p>{info.completedOrders}</p></li>
            <li className='flex justify-between'>Pending Orders<p>{info.pendingOrders}</p></li>
            <li className='flex justify-between'>Cancelled Orders <p>{info.cancelledOrders}</p></li>
            <hr />
            <li className='flex justify-between'>Total Orders <p>{info.totalOrders}</p></li>
            <li className='flex justify-between'>Total Earnings <p>{info.totalEarning}</p></li>
            <li className='flex justify-between'>Potential Earnings <p>{info.potentialEarning}</p></li>
          </ul>
        </div>
      </div>

      {/* Analytics and Ratings Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Analytics Card */}
        <div className="bg-white rounded-md shadow-md p-5">
          <div className="flex items-center space-x-3 mb-4">
            {/* <div className="bg-cyan-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
              03
            </div> */}
            <h2 className="font-bold text-lg bg-cyan-500 text-white rounded w-24 p-1">Analytics</h2>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Clients that made you their favorite</span>
              <span className="font-bold">{fav}</span>
            </div>
            <div className="flex justify-between">
              <span>Daily Orders Number</span>
              <span className="font-bold">{stats.dailyOrders}</span>
            </div>
            <div className="flex justify-between">
              <span>Weekly Orders Number</span>
              <span className="font-bold">{stats.weeklyOrders}</span>
            </div>
          </div>
        </div>

        {/* Ratings Card */}
        <div className="bg-white rounded-md shadow-md p-5">
          <div className="flex items-center space-x-3 mb-4">
            {/* <div className="bg-cyan-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
              04
            </div> */}
            <h2 className="font-bold text-lg bg-cyan-500 text-white rounded w-24 p-1">Ratings</h2>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Ratings 4-5</span>
              <span className="font-bold">{ratings["4-5"]}</span>
            </div>
            <div className="flex justify-between">
              <span>Ratings 3</span>
              <span className="font-bold">{ratings["3"]}</span>
            </div>
            <div className="flex justify-between">
              <span>Ratings 2</span>
              <span className="font-bold">{ratings["2"]}</span>
            </div>
            <div className="flex justify-between">
              <span>Ratings 1</span>
              <span className="font-bold">{ratings["1"]}</span>
            </div>
            <hr />
            <div className="flex justify-between">
              <span>Average Ratings</span>
              <span className="font-bold">{ratings.averageRating}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
