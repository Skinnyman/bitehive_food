import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { serverport } from '../../Static/Variables';
import PickMap from '../../Components/PickMap';

function Profile() {
  const userId = localStorage.getItem('id');

  const [formData, setFormData] = useState({
    userId: userId,
    businessName: '',
    contactPerson: '',
    phone: '+233',
    email: '',
    description: '',
    delivery: '',
    location: '',
  });

  const [originalData, setOriginalData] = useState({});
  const [info, setInfo] = useState([]);
  const [fav, setFav] = useState([]);
  const [stats, setStats] = useState({
    dailyOrders: 0,
    weeklyOrders: 0,
  });
  const [ratings, setRatings] = useState({
    "1": 0, "2": 0, "3": 0, "4-5": 0,
    averageRating: 0,
  });

  const [location, setLocation] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [coords, setCoords] = useState([-1.6221, 6.923]);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch business info
  useEffect(() => {
    axios.get(`${serverport}/api/vendor/business?userId=${userId}`)
      .then((res) => {
        setFormData((prev) => ({ ...prev, ...res.data }));
        setOriginalData(res.data);
      })
      .catch((err) => console.log(err));
  }, [userId]);
  

  // Fetch order info
  useEffect(() => {
    axios.get(`${serverport}/api/vendor/orderinfo?userId=${userId}`)
      .then((res) => setInfo(res.data))
      .catch((err) => console.log(err));
  }, [userId]);

  // Fetch favorites
  useEffect(() => {
    axios.get(`${serverport}/api/vendor/getfavorite?vendorId=${userId}`)
      .then((res) => setFav(res.data))
      .catch((err) => console.log(err));
  }, [userId]);

  // Fetch order stats
  useEffect(() => {
    axios.get(`${serverport}/api/order/orders-stats?userId=${userId}`)
      .then(res => setStats(res.data))
      .catch(console.error);
  }, [userId]);

  // Fetch ratings
  useEffect(() => {
    axios.get(`${serverport}/api/order/rating?userId=${userId}`)
      .then(res => setRatings({
        ...res.data.ratingSummary,
        averageRating: res.data.averageRating
      }))
      .catch(console.error);
  }, [userId]);

  // Handle input change
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Handle update business with error logging
  const handleUpdate = async () => {
    console.log("Updating business with data:", formData);
    try {
      await axios.put(`${serverport}/api/vendor/update-business`, formData);
     // alert("Business info updated successfully");
      setOriginalData(formData); // Update the backup
      setIsEditing(false);
      setShowMap(false);
    } catch (err) {
      console.error(err.response || err);
      //alert("Failed to update business info");
    }
  };

  // Handle cancel: discard changes and exit edit mode
  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
    setShowMap(false);
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Business Info Section */}
        <div className="bg-white p-6 rounded-xl shadow-md w-full lg:w-2/3">
          <h2 className="text-xl font-bold bg-cyan-500 text-white rounded p-1 mb-4">Business Information</h2>
          <hr className='bg-cyan-500 mb-4' />

          <div className="space-y-4">
            {/* Inputs */}
            {[
              { label: "Business Name", name: "businessName" },
              { label: "Contact Person", name: "contactPerson" },
              { label: "Phone", name: "phone" },
              { label: "Email", name: "email" },
            ].map(({ label, name }) => (
              <div key={name}>
                <label className="block font-medium">{label}</label>
                <input
                  type="text"
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full border p-2 rounded bg-white disabled:bg-gray-100"
                />
              </div>
            ))}

            {/* Description */}
            <div>
              <label className="block font-medium">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full border p-2 rounded bg-white disabled:bg-gray-100"
              ></textarea>
            </div>

            {/* Delivery */}
            <div>
              <label className="block font-medium">Makes Delivery</label>
              <select
                name="delivery"
                value={formData.delivery}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full border p-2 rounded bg-white disabled:bg-gray-100"
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {/* Responsive PickMap container */}
            <div className={`w-full h-64 md:h-96 lg:h-[500px] relative bottom-72 right-32 ${showMap ? 'block' : 'hidden'} my-3 rounded shadow-md`}>
              <PickMap
                showMap={showMap}
                setShowMap={setShowMap}
                setCoords={setCoords}
                setLocationAddr={(addr) => {
                  setLocation(addr);
                  setFormData((prev) => ({ ...prev, location: addr }));
                }}
              />
            </div>

            {/* Location display and map toggle */}
            <div
              className={`border w-96 h-10 py-2 rounded-md shadow-md hover:shadow-xl text-center cursor-pointer ${!isEditing ? 'pointer-events-none text-gray-400' : ''}`}
              onClick={() => isEditing && setShowMap(true)}
            >
              {!formData.location ? "Update Location" : formData.location}
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => {
                  if (isEditing) handleUpdate();
                  else setIsEditing(true);
                }}
                className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded"
              >
                {isEditing ? "Update Business" : "Edit Business"}
              </button>

              {isEditing && (
                <button
                  onClick={handleCancel}
                  className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Orders Info Section */}
        <div className="bg-white p-6 rounded-xl shadow-md w-full lg:w-1/3 h-[72vh]">
          <h2 className="text-xl font-bold bg-cyan-500 text-white rounded p-1 mb-4">Orders Information</h2>
          <hr className='bg-cyan-500 mb-4' />
          <ul className="space-y-3 text-gray-700 font-medium">
            <li className='flex justify-between'>Completed Orders<p>{info.completedOrders}</p></li>
            <li className='flex justify-between'>Pending Orders<p>{info.pendingOrders}</p></li>
            <li className='flex justify-between'>Cancelled Orders<p>{info.cancelledOrders}</p></li>
            <hr />
            <li className='flex justify-between'>Total Orders<p>{info.totalOrders}</p></li>
            <li className='flex justify-between'>Total Earnings<p>{info.totalEarning}</p></li>
            <li className='flex justify-between'>Potential Earnings<p>{info.potentialEarning}</p></li>
          </ul>
        </div>
      </div>

      {/* Analytics and Ratings Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-md shadow-md p-5">
          <h2 className="font-bold text-lg bg-cyan-500 text-white rounded w-24 p-1 mb-4">Analytics</h2>
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

        <div className="bg-white rounded-md shadow-md p-5">
          <h2 className="font-bold text-lg bg-cyan-500 text-white rounded w-24 p-1 mb-4">Ratings</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Ratings 4-5</span><span className="font-bold">{ratings["4-5"]}</span></div>
            <div className="flex justify-between"><span>Ratings 3</span><span className="font-bold">{ratings["3"]}</span></div>
            <div className="flex justify-between"><span>Ratings 2</span><span className="font-bold">{ratings["2"]}</span></div>
            <div className="flex justify-between"><span>Ratings 1</span><span className="font-bold">{ratings["1"]}</span></div>
            <hr />
            <div className="flex justify-between"><span>Average Ratings</span><span className="font-bold">{ratings.averageRating}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
