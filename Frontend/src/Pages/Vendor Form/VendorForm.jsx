import axios from 'axios';
import React, { useState } from 'react';
import { FaBuilding, FaPhone, FaEnvelope, FaTruck } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { serverport } from '../../Static/Variables';
import PickMap from '../../Components/PickMap';

const VendorForm = () => {
  const navigate = useNavigate();
  const user = localStorage.getItem('id');

  const [formData, setFormData] = useState({
    userId: user,
    businessName: '',
    contactPerson: '',
    phone: '+233',
    email: '',
    description: '',
    delivery: '',
    location: {
      latitude: '',
      longitude: '',
      address: '',
    },
  });
  console.log("Data",formData)

  const [showMap, setShowMap] = useState(false);
  const [coords, setCoords] = useState([-1.6221, 6.923]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${serverport}/api/vendor/register`, formData);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/vendor');
      console.log('Success:', response.data.message || 'Registration completed');
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-xl"
      >
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">
          Vendor Registration Form
        </h2>

        {/* Business Information */}
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <FaBuilding className="text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold">Business Information</h3>
          </div>
          <input
            type="text"
            name="businessName"
            placeholder="Enter your Business Name"
            value={formData.businessName}
            onChange={handleChange}
            required
            className="w-full border rounded-lg p-3 mt-2"
          />
        </div>

        {/* Contact Information */}
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <FaPhone className="text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold">Contact Information</h3>
          </div>
          <input
            type="text"
            name="contactPerson"
            placeholder="Contact Person Name"
            value={formData.contactPerson}
            onChange={handleChange}
            required
            className="w-full border rounded-lg p-3 mb-3"
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full border rounded-lg p-3 mb-3"
          />
          <input
            type="email"
            name="email"
            placeholder="Contact Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border rounded-lg p-3"
          />
        </div>

        {/* Map Picker */}
        <PickMap
          showMap={showMap}
          setShowMap={setShowMap}
          setCoords={(coord) => {
            setCoords(coord);
            setFormData((prev) => ({
              ...prev,
              location: {
                ...prev.location,
                longitude: coord[0],
                latitude: coord[1],
              },
            }));
          }}
          setLocationAddr={(addr) => {
            setFormData((prev) => ({
              ...prev,
              location: {
                ...prev.location,
                address: addr,
              },
            }));
          }}
        />

        {/* Location Display */}
        <div
          className="my-3 border w-72 h-10 mr-10 py-2 rounded-md shadow-md hover:shadow-xl text-center cursor-pointer"
          onClick={() => setShowMap(true)}
        >
          {!formData.location.address ? 'Pick location' : formData.location.address}
        </div>

        {/* Business Description */}
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <FaEnvelope className="text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold">Business Details</h3>
          </div>
          <textarea
            name="description"
            placeholder="Business Description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full border rounded-lg p-3"
          ></textarea>
        </div>

        {/* Delivery Option */}
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <FaTruck className="text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold">Delivery Options</h3>
          </div>
          <select
            name="delivery"
            value={formData.delivery}
            onChange={(e) => setFormData({ ...formData, delivery: e.target.value })}
            required
            className="w-full border rounded-lg p-3"
          >
            <option value="">Do you accept delivery?</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        {/* Submit Button */}
        <div className="text-center mt-6">
          <button
            type="submit"
            className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg hover:bg-blue-700 transition"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default VendorForm;
