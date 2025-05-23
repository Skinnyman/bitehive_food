import React, { useState } from "react";
import { MdOutlineDone, MdCancel } from "react-icons/md";
import { IoStarSharp } from "react-icons/io5";
import axios from "axios";
import { motion } from "framer-motion";
import { serverport } from "../Static/Variables";


function OrderInformation({order,fetchOrders}) {
  const [status, setStatus]= useState(order.status)
  const [rating, setRating] = useState(order.rating);
  const [editedRating, setEditedRating] = useState(false);

  const handleCancel = async()=>{
    await axios.patch(`${serverport}/api/order/status/${order._id}`, { status: "cancelled" });
    setStatus("cancelled");
    fetchOrders()
  }


  return (
    <motion.div 
    className="flex flex-col h-fit w-[400px] border p-2 mr-2 mb-5 shadow-md hover:shadow-xl bg-blue-100"
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{duration:0.5}}
    >
      
      {/* Title */}
      <div className="flex flex-row items-center mb-4">
        <div className="text-lg font-bold ml-2">Order Information</div>
      </div>
    
      {/* Order Details */}
      <div className="flex flex-col items-center">
      <PropValue property="Meal Name:" value={order.mealName} />
      <PropValue property="Price:" value={`GHC ${order.price}`} />
      <PropValue property="Quantity:" value={order.quantity || 1} />
      <PropValue property="Type:" value={order.deliveryOption} />
      <PropValue property="Status:" value={status} />
      <PropValue property="Total Price:" value={`GHC ${order.totalPrice}`} />
      </div>

      {/* Order Action Buttons */}
      {order.status === "cancelled" && (
                    <div className="flex items-center mt-3 text-red-600 font-semibold">
                      <MdCancel className="mr-2" />
                      Order Cancelled
                    </div>
                  )}
      {status === "pending" && (
        <div className="flex flex-row mt-4 gap-3">
          <div className="flex items-center border px-3 py-2 bg-yellow-100">
            <MdOutlineDone className="text-yellow-500 mr-2" />
            <span>Order Pending</span>
          </div>
          <button onClick={handleCancel} className="flex items-center border px-3 py-2 hover:bg-red-200">
            <MdCancel className="text-red-500 mr-2" />
            <span>Cancel Order</span>
          </button>
        </div>
      )}
       {status === "accepted" && (
        <div className="mt-4 text-green-600 flex items-center">
          <MdOutlineDone className="mr-2" /> Order Accepted
        </div>
      )}
      
        {status === "completed" && (
        <>
          <div className="mt-4 flex items-center text-green-700">
            <MdOutlineDone className="mr-2" />
            Order Completed
          </div>

          <div className="flex mt-4 items-center border px-3 py-2">
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
              alert(`You rated ${rating} star(s)`);
              setEditedRating(false);
            }}
              className="flex items-center border mt-2 px-3 py-2 bg-green-100 hover:bg-green-200"
            >
              <MdOutlineDone className="text-green-500 mr-2" />
              Submit Rating
            </button>
          )}
        </>
      )}
      

      {/* Completed Order Actions */}
      {/* <div className="flex flex-col mt-4">
        <div className="flex flex-row items-center border px-3 py-2 cursor-pointer hover:shadow-xl hover:bg-green-200">
          <MdOutlineDone className="text-green-500 mr-2" size={22} />
          <span>Mark As Order Received</span>
        </div> */}

        {/* Order Completed Notice */}
        {/* <div className="flex flex-row items-center border mt-3 px-3 py-2 hover:bg-green-200">
          <MdOutlineDone className="text-green-500 mr-2" size={22} />
          <span>This order has been completed</span>
        </div>
      </div> */}

      {/* Rating Section */}
      {/* <div className="flex flex-row items-center border mt-4 px-3 py-3">
        <div className="text-sm font-semibold text-gray-500 mr-4">Rating:</div>
        {[1, 2, 3, 4, 5].map((num) => (
          <IoStarSharp
            key={num}
            className={`mr-2 ${rating >= num ? "text-yellow-400" : "text-gray-300"} cursor-pointer`}
            size={22}
            onClick={() => {
              setRating(num);
              setEditedRating(true);
            }}
          />
        ))}
      </div> */}

      {/* Submit Rating Button */}
      {/* {editedRating && (
        <div
          className="flex flex-row items-center border mt-3 px-3 py-2 cursor-pointer hover:shadow-xl hover:bg-green-200"
          onClick={() => {
            alert(`Rating submitted: ${rating}`);
            setEditedRating(false);
          }}
        >
          <MdOutlineDone className="text-green-500 mr-2" size={22} />
          <span>Submit Rating</span>
        </div>
      )} */}
    </motion.div>
  );
}

// Template for showing properties
function PropValue({ property, value }) {
  return (
    <div className="flex flex-row w-full justify-between border-b py-2">
      <div className="font-semibold">{property}</div>
      <div>{value}</div>
    </div>
  );
}

export default OrderInformation;
