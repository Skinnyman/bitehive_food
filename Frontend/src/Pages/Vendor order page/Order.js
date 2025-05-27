import React, { useEffect, useState } from "react";
import { MdOutlineDone, MdCancel,MdOutlineShare } from "react-icons/md";
import { IoStarSharp } from "react-icons/io5";
import axios from "axios";
import { serverport } from "../../Static/Variables";
import PickMap from "../../Components/PickMap";



function Order() {
  //const [rating, setRating] = useState(0);
  //const [editedRating, setEditedRating] = useState(false);
  const [allorder,setAllOrder] = useState([]);
   const [showMap,setShowMap] = useState(false);
    const [routeCoords, setRouteCoords] = useState(null);
   const [longitude,setLongitude] = useState("");
   const [latitude,setlatitude] = useState("");
   const userId = localStorage.getItem("id");

    //  const [formdata, setFormdata] = useState({
    //    userId:userId,
    //    Deliveryman:"",
    //    Deliveryphone:"",
    //  });
    //  const [fee,setfee] = useState({
    //   orderId:"",
    //   userId:userId,
    //   deliveryCharge:""
    //  })
   //console.log("data",fee)
   const [formdata, setFormdata] = useState({});
const [fee, setfee] = useState({});


   const senddata = async () =>{
      
    try {
      await axios.patch(`${serverport}/api/order/deliveryinfo`, formdata);
      await axios.patch(`${serverport}/api/order/deliveryfee`, fee);
    } catch (err) {
      console.log(err);
    }
   };
   //console.log("data",formdata)
   

   useEffect(() => {
    axios.get(`${serverport}/api/order/location?userId=${userId}`)
      .then(res => {
        const vendor = res.data[0];
        //console.log(vendor)
        if (vendor) {
          setLongitude(vendor.location.longitude);
          setlatitude(vendor.location.latitude);
        }
      })
      .catch(err => {
        console.error("Failed to fetch vendor location:", err);
      });
  }, [userId]);

  const handleShowMap = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      const userCoords = [position.coords.longitude, position.coords.latitude];
      const vendorCoords = [longitude, latitude];
      setRouteCoords([userCoords, vendorCoords]);
      setShowMap(true);
    }, (error) => {
      alert("Failed to get your location. Please allow location access.");
    });
  };

  const fetchOrders = async()=>{
    const userId = localStorage.getItem('id');
   // console.log(userId)
    axios.get(`${serverport}/api/order/getorder?userId=${userId}`)
    .then((res) => {
      //console.log('API response:', res.data);
      const data = res.data;
      // force it into an array if it's a single object
      if (Array.isArray(data)) {
        setAllOrder(data);
      } else {
        setAllOrder([data]); // wrap object in an array
      }
    })
    .catch((err) => {
      console.log(err);
      setAllOrder([]); // fallback on error
    });
  }
  const updateStatus = async (id, newStatus) => {
     await axios.patch(`${serverport}/api/order/status/${id}`, {
      status: newStatus,
    });
    fetchOrders(); // refresh data
  };
   useEffect(()=>{
      fetchOrders()
    },[])
    //console.log(allorder)

  return (
    <div  className="grid grid-cols-1 md:grid-cols-2 gap-14">
        {allorder?.length === 0 && <div>No orders available</div>}
 {allorder.slice().reverse().map((order) => (     
        <div key={order._id} className="flex flex-col h-fit w-[400px] border p-2 mr-2 mb-5 shadow-md hover:shadow-xl bg-blue-100">
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

    {/* Order Action Buttons */}
    {order.status === "pending" && (
              <div className="flex mt-3 gap-3">
                <button onClick={() => updateStatus(order._id, "accepted")} className="flex items-center border px-3 py-2 bg-green-100 hover:bg-green-200">
                  <MdOutlineDone className="text-green-500 mr-2" /> Accept Order
                </button>
                <button onClick={() => updateStatus(order._id, "cancelled")} className="flex items-center border px-3 py-2 hover:bg-red-200">
                  <MdCancel className="text-red-500 mr-2" /> Cancel Order
                </button>
              </div>
            )}


    {/* Completed Order Actions */}
    {order.status === "accepted" && order.deliveryOption === "pickup"  && (
              <div className="flex mt-3">
                <button onClick={() => updateStatus(order._id, "completed")} className="flex items-center border px-3 py-2 bg-green-200 hover:bg-green-300">
                  <MdOutlineDone className="text-green-600 mr-2" /> Mark as Ready
                </button>
              </div>
            )}
    {order.status === "accepted" && order.deliveryOption === "delivery"  && (
              <div className="flex mt-3">
                <button onClick={() => updateStatus(order._id, "completed")} className="flex items-center border px-3 py-2 bg-green-200 hover:bg-green-300">
                  <MdOutlineDone className="text-green-600 mr-2" /> Mark as Ready
                </button>
              </div>
            )}

{order.status === "completed"  &&  order.deliveryOption === "pickup" &&(
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
 {order.status === "cancelled" && (
              <div className="flex items-center mt-3 text-red-600 font-semibold">
                <MdCancel className="mr-2" />
                Order Cancelled
              </div>
            )}
{order.status === "completed" &&  order.deliveryOption === "delivery"  &&(
            <div className="flex flex-col mt-3 text-green-700 font-semibold">
                          <button
                        onClick={handleShowMap}
                        className="mt-2 px-4 py-2 border rounded-md bg-blue-200 hover:bg-blue-300"
                      >
                        Show Delivery location
                      </button>

                      {/* Show Map */}
                      <PickMap
                        showMap={showMap}
                        setShowMap={setShowMap}
                        route={routeCoords}
                      />
                             <input
                                onChange={(e) =>
                                  setFormdata({
                                    ...formdata,
                                    [order._id]: {
                                      ...(formdata[order._id] || {}),
                                      Deliveryman: e.target.value,
                                      userId: userId
                                    },
                                  })
                                }
                                value={formdata[order._id]?.Deliveryman || ""}
                                placeholder="Enter rider's name"
                                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                                <input
                                  onChange={(e) =>
                                    setFormdata({
                                      ...formdata,
                                      [order._id]: {
                                        ...(formdata[order._id] || {}),
                                        Deliveryphone: e.target.value,
                                        userId: userId
                                      },
                                    })
                                  }
                                  value={formdata[order._id]?.Deliveryphone || ""}
                                  placeholder="+233 055......"
                                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />

                      <label>Delivery Fee:</label>
                    <input
                        type="number"
                        onChange={(e) => {
                          const value = Math.max(0, Number(e.target.value));
                          setfee({
                            ...fee,
                            [order._id]: {
                              deliveryCharge: value,
                              orderId: order._id,
                              userId: userId
                            },
                          });
                        }}
                        value={fee[order._id]?.deliveryCharge || ""}
                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                                  <div className="flex cursor-pointer flex-row items-center border px-3 py-3 mt-2 hover:bg-green-200"
						       onClick={senddata}
					>
						<MdOutlineDone className={`text-green-500 mr-2`} size={22} />
						<span>Submit Delivery Info</span>
					</div>
          <div
						className="flex cursor-pointer flex-row items-center border px-3 py-3 mt-2 hover:bg-green-200"
					>
						<MdOutlineShare className={`text-green-500 mr-2`} size={22} />
						<span>Share Delivery Location</span>
					</div>


                {/* <div className="flex items-center">
                <MdOutlineDone className="mr-2" />
                Order Completed
                </div> */}
                {/* {order.rating > 0 && (
                <div className="flex items-center mt-2">
                    <span className="mr-2">Rating:</span>
                    {[...Array(order.rating)].map((_, i) => (
                    <IoStarSharp key={i} className="text-yellow-400 mr-1" />
                    ))}
                </div>
                )} */}
            </div>
)}            
    

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
  </div>


  
   ))}
    </div>
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

export default Order;
