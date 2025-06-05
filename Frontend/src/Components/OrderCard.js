import React, { useEffect, useState } from "react";
import { MdOutlineDone, MdCancel } from "react-icons/md";
import { IoStarSharp } from "react-icons/io5";
import axios from "axios";
import { motion } from "framer-motion";
import { serverport } from "../Static/Variables";
import PickMap from "./PickMap";
import { toast } from "react-toastify";

function OrderInformation({ order, fetchOrders, info }) {
  const [status, setStatus] = useState(order.status);
  const [rating, setRating] = useState(order.rating);
  const [editedRating, setEditedRating] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [routeCoords, setRouteCoords] = useState(null);
  const [longitude, setLongitude] = useState("");
  const [latitude, setlatitude] = useState("");

  const handleCancel = async () => {
    await axios.patch(`${serverport}/api/order/status/${order._id}`, {
      status: "cancelled",
    });
    setStatus("cancelled");
    fetchOrders();
  };
  const userId = order.userId;
  useEffect(() => {
    axios
      .get(`${serverport}/api/vendor/location?userId=${userId}`)
      .then((res) => {
        const vendor = res.data[0];
        if (vendor) {
          setLongitude(vendor.location.longitude);
          setlatitude(vendor.location.latitude);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch vendor location:", err);
      });
  }, [userId]);

  const handleShowMap = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userCoords = [position.coords.longitude, position.coords.latitude];
        const vendorCoords = [longitude, latitude];
        setRouteCoords([userCoords, vendorCoords]);
        setShowMap(true);
      },
      (error) => {
        alert("Failed to get your location. Please allow location access.");
      }
    );
  };

  const changeStatus = async () => {
    await axios.patch(`${serverport}/api/order/status/${order._id}`, {
      status: "finished",
    });
    setStatus("finished");
    fetchOrders();
  };

  return (
    <motion.div
      className="flex flex-col h-fit w-full max-w-md sm:max-w-lg md:max-w-xl border p-4 sm:p-6 mb-5 shadow-md hover:shadow-xl bg-blue-100 rounded-md"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Title */}
      <div className="flex flex-row items-center mb-4">
        <div className="text-lg sm:text-xl font-bold ml-2">Order Information</div>
      </div>

      {/* Order Details */}
      <div className="flex flex-col items-center w-full">
        <PropValue property="Meal Name:" value={order.mealName} />
        <PropValue property="Price:" value={`GHC ${order.price}`} />
        <PropValue property="Quantity:" value={order.quantity || 1} />
        <PropValue property="Type:" value={order.deliveryOption} />
        {order.deliveryCharge?.length > 0 && (
          <PropValue property="Delivery Fee:" value={order.deliveryCharge} />
        )}

        <PropValue property="Status:" value={status} />
        <PropValue property="Total Price:" value={`GHC ${order.totalPrice}`} />

        {order.deliveryOption === "delivery" && status === "search" && (
          <PropValue property="Delivery Status:" value="Looking for driver" />
        )}
        {order.deliveryOption === "delivery" && status === "completed" && (
          <>
            <PropValue property="Delivery Status:" value="Driver assigned" />
            <PropValue property="Rider's Name:" value={info.Deliveryman} />
            <PropValue property="Rider's Contact:" value={info.Deliveryphone} />
          </>
        )}
      </div>

      {/* Order Action Buttons */}
      {order.status === "cancelled" && (
        <div className="flex items-center mt-3 text-red-600 font-semibold">
          <MdCancel className="mr-2" />
          Order Cancelled
        </div>
      )}
      {status === "pending" && (
        <div className="flex flex-col sm:flex-row mt-4 gap-3 justify-center sm:justify-start">
          <div className="flex items-center border px-3 py-2 bg-yellow-100 justify-center">
            <MdOutlineDone className="text-yellow-500 mr-2" />
            <span>Order Pending</span>
          </div>
          <button
            onClick={handleCancel}
            className="flex items-center border px-3 py-2 hover:bg-red-200 justify-center"
          >
            <MdCancel className="text-red-500 mr-2" />
            <span>Cancel Order</span>
          </button>
        </div>
      )}
      {status === "accepted" && (
        <div className="mt-4 text-green-600 flex items-center justify-center sm:justify-start">
          <MdOutlineDone className="mr-2" /> Order Accepted
        </div>
      )}

      {order.deliveryOption === "pickup" && status === "completed" && (
        <>
          <div className="mt-4 text-green-700 flex items-center justify-center sm:justify-start">
            <MdOutlineDone className="mr-2" />
            Order Completed
          </div>

          {/* Pickup Meal Location Button */}
          <button
            onClick={handleShowMap}
            className="mt-2 px-4 py-2 border rounded-md bg-blue-200 hover:bg-blue-300 w-full sm:w-auto"
          >
            Pickup Meal Location
          </button>

          {/* Show Map */}
          <PickMap showMap={showMap} setShowMap={setShowMap} route={routeCoords} />

          {/* Rating Section */}
          <div className="flex mt-4 items-center border px-3 py-2 justify-center sm:justify-start">
            <span className="font-semibold mr-4">Rate:</span>
            {[1, 2, 3, 4, 5].map((num) => (
              <IoStarSharp
                key={num}
                onClick={() => {
                  setRating(num);
                  setEditedRating(true);
                }}
                className={`mr-2 ${rating >= num ? "text-yellow-400" : "text-gray-300"} cursor-pointer`}
              />
            ))}
          </div>

          {editedRating && (
            <button
              onClick={async () => {
                await axios.patch(`${serverport}/api/order/rate/${order._id}`, { rating });
                toast.info(`You rated ${rating} star(s)`);
                setEditedRating(false);
              }}
              className="flex items-center border mt-2 px-3 py-2 bg-green-100 hover:bg-green-200 w-full sm:w-auto justify-center"
            >
              <MdOutlineDone className="text-green-500 mr-2" />
              Submit Rating
            </button>
          )}
        </>
      )}

      {order.deliveryOption === "delivery" && status === "search" && (
        <div className="mt-4 text-green-700 flex items-center justify-center sm:justify-start">
          <MdOutlineDone className="mr-2" />
          Order Completed, waiting for driver
        </div>
      )}

      {order.deliveryOption === "delivery" && status === "completed" && (
        <div
          className="flex flex-row items-center border px-3 py-2 cursor-pointer hover:shadow-xl hover:bg-green-200 justify-center"
          onClick={changeStatus}
        >
          <MdOutlineDone className="text-green-500 mr-2" size={22} />
          <span>Mark As Order Received</span>
        </div>
      )}

      {order.deliveryOption === "delivery" && status === "finished" && (
        <>
          <div className="flex flex-row items-center border mt-3 px-3 py-2 hover:bg-green-200 justify-center">
            <MdOutlineDone className="text-green-500 mr-2" size={22} />
            <span>This order has been completed</span>
          </div>
          <div className="flex mt-4 items-center border px-3 py-2 justify-center sm:justify-start">
            <span className="font-semibold mr-4">Rate:</span>
            {[1, 2, 3, 4, 5].map((num) => (
              <IoStarSharp
                key={num}
                onClick={() => {
                  setRating(num);
                  setEditedRating(true);
                }}
                className={`mr-2 ${rating >= num ? "text-yellow-400" : "text-gray-300"} cursor-pointer`}
              />
            ))}
          </div>
          {editedRating && (
            <button
              onClick={async () => {
                await axios.patch(`${serverport}/api/order/rate/${order._id}`, { rating });
                toast.info(`You rated ${rating} star(s)`);
                setEditedRating(false);
              }}
              className="flex items-center border mt-2 px-3 py-2 bg-green-100 hover:bg-green-200 w-full sm:w-auto justify-center"
            >
              <MdOutlineDone className="text-green-500 mr-2" />
              Submit Rating
            </button>
          )}
        </>
      )}
    </motion.div>
  );
}

// Template for showing properties
function PropValue({ property, value }) {
  return (
    <div className="flex flex-row w-full justify-between border-b py-2 text-sm sm:text-base">
      <div className="font-semibold">{property}</div>
      <div className="break-words text-right max-w-[50%] sm:max-w-[60%]">{value}</div>
    </div>
  );
}

export default OrderInformation;
