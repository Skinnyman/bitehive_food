import React, { useEffect, useState } from "react";
import { MdOutlineDone, MdCancel, MdOutlineShare } from "react-icons/md";
import { IoStarSharp } from "react-icons/io5";
import axios from "axios";
import { serverport } from "../../Static/Variables";
import PickMap from "../../Components/PickMap";

function Order() {
  const [allorder, setAllOrder] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [routeCoords, setRouteCoords] = useState(null);
  const [selectedOrderLocation, setSelectedOrderLocation] = useState(null); // holds lat/long for selected order
  const [formdata, setFormdata] = useState({});
  const [fee, setfee] = useState({});
  const userId = localStorage.getItem("id");

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${serverport}/api/order/getorder?userId=${userId}`);
      const orders = Array.isArray(res.data) ? res.data : [res.data];

      // Fetch locations for each order
      const locationsPromises = orders.map(async (order) => {
        const locRes = await axios.get(`${serverport}/api/order/location?orderId=${order._id}`);
        return {
          ...order,
          location: locRes.data[0]?.location || {},
        };
      });

      const ordersWithLocations = await Promise.all(locationsPromises);
      setAllOrder(ordersWithLocations);
    } catch (err) {
      console.error("Failed to fetch orders or locations:", err);
      setAllOrder([]);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, newStatus) => {
    await axios.patch(`${serverport}/api/order/status/${id}`, {
      status: newStatus,
    });
    fetchOrders(); // refresh data
  };

  const handleShowMap = (order) => {
    if (!order?.location?.longitude || !order?.location?.latitude) {
      alert("Location not available for this order.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userCoords = [position.coords.longitude, position.coords.latitude];
        const vendorCoords = [order.location.longitude, order.location.latitude];

        setRouteCoords([userCoords, vendorCoords]);
        setSelectedOrderLocation(order._id);
        setShowMap(true);
      },
      () => {
        alert("Failed to get your location. Please allow location access.");
      }
    );
  };

  const senddata = async (orderId) => {
    try {
      if (formdata[orderId]) {
        await axios.patch(`${serverport}/api/order/deliveryinfo`, formdata[orderId]);
      }
      if (fee[orderId]) {
        await axios.patch(`${serverport}/api/order/deliveryfee`, fee[orderId]);
      }
      // Refresh orders to get updated delivery info and show the message persistently
      fetchOrders();
    } catch (err) {
      console.error("Error submitting delivery data:", err);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-14">
      {allorder?.length === 0 && <div>No orders available</div>}
      {allorder.slice().reverse().map((order) => (
        <div
          key={order._id}
          className="flex flex-col h-fit w-[400px] border p-2 mr-2 mb-5 shadow-md hover:shadow-xl bg-blue-100"
        >
          <h1 className="text-lg font-bold ml-2">Order Information</h1>

          <div className="flex flex-col items-center">
            <PropValue property="Meal Name:" value={order.mealName} />
            <PropValue property="Price:" value={`GHC ${order.price}`} />
            <PropValue property="Quantity:" value={order.quantity || 1} />
            <PropValue property="Type:" value={order.deliveryOption} />
            <PropValue property="Delivery Fee:" value={order.deliveryCharge} />
            <PropValue property="Status:" value={order.status} />
            <PropValue property="Total Price:" value={`GHC ${order.totalPrice}`} />
          </div>

          {order.status === "pending" && (
            <div className="flex mt-3 gap-3">
              <button
                onClick={() => updateStatus(order._id, "accepted")}
                className="flex items-center border px-3 py-2 bg-green-100 hover:bg-green-200"
              >
                <MdOutlineDone className="text-green-500 mr-2" /> Accept Order
              </button>
              <button
                onClick={() => updateStatus(order._id, "cancelled")}
                className="flex items-center border px-3 py-2 hover:bg-red-200"
              >
                <MdCancel className="text-red-500 mr-2" /> Cancel Order
              </button>
            </div>
          )}

          {order.status === "accepted" && (
            <div className="flex mt-3">
              <button
                onClick={() => updateStatus(order._id, "completed")}
                className="flex items-center border px-3 py-2 bg-green-200 hover:bg-green-300"
              >
                <MdOutlineDone className="text-green-600 mr-2" /> Mark as Ready
              </button>
            </div>
          )}

          {order.status === "completed" && order.deliveryOption === "pickup" && (
            <div className="flex flex-col mt-3 text-green-700 font-semibold">
              <div className="flex items-center">
                <MdOutlineDone className="mr-2" />
                Order Completed
              </div>
              {order.rating > 0 && (
                <div className="flex items-center mt-2">
                  <span className="mr-2">Rating:</span>
                  {[...Array(order.rating)].map((_, i) => (
                    <IoStarSharp key={i} className="text-yellow-400 mr-1" />
                  ))}
                </div>
              )}
            </div>
          )}

          {order.status === "completed" && order.deliveryOption === "delivery" && (
            <div className="flex flex-col mt-3 text-green-700 font-semibold">
              <button
                onClick={() => handleShowMap(order)}
                className="mt-2 px-4 py-2 border rounded-md bg-blue-200 hover:bg-blue-300"
              >
                Show Delivery location
              </button>

              {showMap && selectedOrderLocation === order._id && (
                <PickMap showMap={showMap} setShowMap={setShowMap} route={routeCoords} />
              )}

              {(order.Deliveryman || order.Deliveryphone || order.deliveryCharge) ? (
                <div className="flex items-center border px-3 py-3 bg-green-300 text-green-900 font-semibold select-none mt-4">
                  <MdOutlineDone className="mr-2" size={22} />
                  <span>This order is being delivered</span>
                </div>
              ) : (
                <>
                  <input
                    onChange={(e) =>
                      setFormdata({
                        ...formdata,
                        [order._id]: {
                          ...(formdata[order._id] || {}),
                          Deliveryman: e.target.value,
                          userId,
                          orderId: order._id,
                        },
                      })
                    }
                    value={formdata[order._id]?.Deliveryman || ""}
                    placeholder="Enter rider's name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-3"
                  />
                  <input
                    onChange={(e) =>
                      setFormdata({
                        ...formdata,
                        [order._id]: {
                          ...(formdata[order._id] || {}),
                          Deliveryphone: e.target.value,
                        },
                      })
                    }
                    value={formdata[order._id]?.Deliveryphone || ""}
                    placeholder="+233 055......"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-3"
                  />

                  <label className="mt-3">Delivery Fee:</label>
                  <input
                    type="number"
                    onChange={(e) => {
                      const value = Math.max(0, Number(e.target.value));
                      setfee({
                        ...fee,
                        [order._id]: {
                          deliveryCharge: value,
                          userId,
                          orderId: order._id,
                        },
                      });
                    }}
                    value={fee[order._id]?.deliveryCharge || ""}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div
                    className="flex cursor-pointer flex-row items-center border px-3 py-3 mt-3 hover:bg-green-200"
                    onClick={() => senddata(order._id)}
                  >
                    <MdOutlineDone className={`text-green-500 mr-2`} size={22} />
                    <span>Submit Delivery Info</span>
                  </div>

                  <div className="flex cursor-pointer flex-row items-center border px-3 py-3 mt-2 hover:bg-green-200">
                    <MdOutlineShare className={`text-green-500 mr-2`} size={22} />
                    <span>Share Delivery Location</span>
                  </div>
                </>
              )}
            </div>
          )}

          {order.status === "cancelled" && (
            <div className="flex items-center mt-3 text-red-600 font-semibold">
              <MdCancel className="mr-2" />
              Order Cancelled
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function PropValue({ property, value }) {
  return (
    <div className="flex flex-row w-full justify-between border-b py-2">
      <div className="font-semibold">{property}</div>
      <div>{value}</div>
    </div>
  );
}

export default Order;
