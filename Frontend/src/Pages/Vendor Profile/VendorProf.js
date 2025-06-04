import React, { useEffect, useState } from 'react';
import { FaStar } from "react-icons/fa";
import { FaCartShopping } from "react-icons/fa6";
import axios from 'axios';
import { useParams } from 'react-router-dom';
//import { useOrder } from '../context/OrderContext';
import { serverport } from '../../Static/Variables';
import io from "socket.io-client";
import PickMap from '../../Components/PickMap';
const socket = io(serverport);

function VendorProf() {
  const username = localStorage.getItem('username');  
  const [meals, setMeals] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [accompaniments, setAccompaniments] = useState([]);
  const [deliveryOption, setDeliveryOption] = useState("pickup");
  const [showMap, setShowMap] = useState(false);
const [coords, setCoords] = useState([-1.6221, 6.923]);
const [formdata, setFormdata] = useState({
      userId:"",
      clientName: "",
      contact_person_phone: "",
      location: {
        latitude: '',
        longitude: '',
        address: '',
      },
    });
  //const { addOrder } = useOrder(); // <-- Changed here

  const { userId } = useParams(); // 👈 get vendorId from route

  //console.log(userId)
  useEffect(() => {
    //const userId = localStorage.getItem('id');
    axios.get(`${serverport}/api/meal/meal?userId=${userId}`)
      .then((res) => {
        const data = res.data;
        setMeals(Array.isArray(data) ? data : [data]);
      })
      .catch((err) => {
        console.log(err);
        setMeals([]);
      });
      
  }, [userId]);
  

// handling clicks of meals
  const handleOrderClick = (meal) => {
    setSelectedMeal(meal);
    setShowModal(true);

    if (meal.chargeType === "price") {
      setPrice(parseInt(meal.price) || 0);
    } else if (meal.chargeType === "quantity") {
      setQuantity(1);
      setPrice(parseInt(meal.price) || 0);
    } else if (meal.chargeType === "free") {
      setPrice(0);
      setQuantity(1);
    }

    setAccompaniments([]);
    setDeliveryOption("pickup");
  };

  //handling chat functionality

  const calculatePrice = (num) => {
    const number = parseInt(num);
    if (selectedMeal?.chargeType === "price") {
      if (number < selectedMeal?.price) {
        setPrice(selectedMeal?.price);
      } else {
        setPrice(number);
      }
    } else if (selectedMeal?.chargeType === "quantity") {
      if (number < 1) {
        setQuantity(1);
        return;
      }
      setQuantity(number);
    }
  };

  const totalPrice = selectedMeal?.chargeType === "free"
    ? 0
    : selectedMeal?.chargeType === "quantity"
    ? price * quantity
    : price;

  const handleSubmitOrder = async () => {
    socket.emit("place_order",{message:`New order from ${username}`,vendorId:selectedMeal.userId})
    const orderData = {
      mealName: selectedMeal.name,
      mealId: selectedMeal._id,   
      price: selectedMeal.price,
      quantity,
      totalPrice,
      userId: selectedMeal.userId,
      deliveryOption,
      accompanimentsName:selectedMeal.accompaniment.name,
      chargeType: selectedMeal.chargeType,
      image: selectedMeal.image,
     
    };

    //addOrder(orderData); // <-- Add instead of replace
    console.log("Order submitted:", orderData);
    try {
      await axios.post(`${serverport}/api/order/ordered`, orderData);
      //console.log("Success:", response.data.message || "order made");
      
    } catch (err) {
      console.log(err);
    }
    setShowModal(false);
  };

 // console.log(meals)


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-6">
      { meals.length === 0 ? (
         <div>No Vendor meals available</div>
        )  : (
      meals.map((meal) => (
        <div key={meal._id} className="border w-[350px] h-52 rounded-xl shadow-md hover:shadow-xl flex flex-row items-center bg-white">
          <div className="w-2/5 flex justify-center items-center">
            <div className="h-36 w-36 bg-slate-400 rounded-xl overflow-hidden">
              <img
                src={`${serverport}/${meal.image}`}
                alt={meal.name}
                className="h-full w-full object-cover rounded-xl"
              />
            </div>
          </div>
          <div className="w-3/5 flex flex-col justify-between p-2">
            <div>
              <div className="font-bold text-lg mb-1">{meal.name}</div>
              <div className="text-sm text-gray-600 break-words whitespace-normal">{meal.description}</div>
            </div>
            <div className="flex flex-row justify-between items-center mt-2">
              <div className="text-xl font-bold">₵ {meal.price}</div>
            </div>
            <div className="flex flex-row justify-between items-center mt-2">
              <div className="w-14 h-8 bg-slate-900 text-white flex items-center justify-center rounded-lg text-sm font-bold">
                {meal.mealType?.substring(0, 6)}
              </div>
              <div className="w-[30%] h-8 bg-slate-900 text-white flex items-center justify-center rounded-lg text-sm font-bold">
                <FaStar className="text-yellow-500 mr-1" />
                3
              </div>
              <div
                onClick={() => handleOrderClick(meal)}
                className="w-[40%] h-8 bg-slate-900 text-white flex items-center justify-center rounded-lg text-sm font-bold hover:shadow-lg cursor-pointer"
              >
                <FaCartShopping className="mr-1" />
                Order
              </div>
            </div>
          </div>
        </div>
      )
      ))}

      {showModal && selectedMeal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center px-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex w-full justify-center items-center mb-2">
              <span className="font-bold text-2xl">Place Order</span>
            </div>
            <div className="flex flex-col items-center px-2">
              <div className="w-full h-40 border">
                <img
                  src={`${serverport}/${selectedMeal.image}`}
                  alt={selectedMeal.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-row w-full justify-between mt-1">
                <span className="text-sm font-roboto">
                  {selectedMeal.chargeType === "price"
                    ? "Custom price"
                    : selectedMeal.chargeType === "free"
                    ? "Free meal"
                    : "Price per quantity"}
                </span>
                <span className="text-sm font-bold">₵ {selectedMeal.price}</span>
              </div>
              <div className="flex flex-row w-full justify-between">
                <span className="text-lg font-bold">{selectedMeal.name}</span>
                {selectedMeal.chargeType !== "free" && (
                  <div className="flex flex-row border items-center">
                    <input
                      type="number"
                      className="w-14 outline-none px-1"
                      value={selectedMeal.chargeType === "price" ? price : quantity}
                      onChange={(e) => calculatePrice(e.target.value)}
                    />
                  </div>
                )}
              </div>
              <div className="w-full mt-2 font-bold break-words whitespace-normal">
                {selectedMeal.description}
              </div>
              <div className="w-full mt-2">
                  {(Array.isArray(selectedMeal?.accompaniment)
                    ? selectedMeal.accompaniment.length > 0
                    : !!selectedMeal?.accompaniment
                  ) && (
                    (Array.isArray(selectedMeal?.accompaniment)
                      ? selectedMeal.accompaniment
                      : [selectedMeal.accompaniment]
                    ).map((acc, idx) => (
                      acc.price > 0 && (
                        <div key={idx} className="flex flex-row w-full mb-1">
                          <input
                            type="checkbox"
                            className="mr-2"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAccompaniments((prev) => [...prev, acc]);
                                if (acc.isFree === "No") {
                                  setPrice((prev) => prev + acc.price);
                                }
                              } else {
                                setAccompaniments((prev) =>
                                  prev.filter((a) => a.name !== acc.name)
                                );
                                if (acc.isFree === "No") {
                                  setPrice((prev) => prev - acc.price);
                                }
                              }

                              //console.log("data", accompaniments);
                            }}
                          />
                          <label className="block text-gray-500 font-semibold text-sm">
                            {acc.name} - {acc.isFree === "Yes" ? "Free" : `Ghc ${acc.price}`}
                          </label>
                        </div>
                      )
                    ))
                  )}
                    </div>

              <div className="w-full mt-4">
                <label className="text-sm font-semibold block mb-1">Delivery Option</label>
                <select
                  value={deliveryOption}
                  onChange={(e) => setDeliveryOption(e.target.value)}
                  className="w-full border rounded-md p-2"
                >
                  <option value="pickup">Pickup</option>
                  <option value="delivery">Delivery</option>
                </select>
              </div>
              {deliveryOption === "delivery" && (
                <>
                  <input
                    type="text"
                    placeholder="Enter your name..."
                    value={formdata.clientName}
                    onChange={(e) => setFormdata({ ...formdata, clientName: e.target.value })}
                    className="my-3 border w-full py-2 rounded-md shadow-md"
                  />
                  <input
                    type="tel"
                    placeholder="+233 055......"
                    value={formdata.contact_person_phone}
                    onChange={(e) => setFormdata({ ...formdata, contact_person_phone: e.target.value })}
                    className="my-3 border w-full py-2 rounded-md shadow-md"
                  />
                      {/* Map Picker */}
                          <PickMap
                            showMap={showMap}
                            setShowMap={setShowMap}
                            setCoords={(coord) => {
                              setCoords(coord);
                              setFormdata((prev) => ({
                                ...prev,
                                location: {
                                  ...prev.location,
                                  longitude: coord[0],
                                  latitude: coord[1],
                                },
                              }));
                            }}
                            setLocationAddr={(addr) => {
                              setFormdata((prev) => ({
                                ...prev,
                                location: {
                                  ...prev.location,
                                  address: addr,
                                },
                              }));
                            }}
                          />
                  <div
                    className="my-3 border w-full py-2 rounded-md shadow-md hover:shadow-xl text-center cursor-pointer"
                    onClick={() => setShowMap(true)}
                  >
                    {!formdata.location.address ? "Pick location" :  formdata.location.address}
                  </div>
                </>
              )}


              <div className="w-full flex flex-row justify-between items-center mt-4">
                <div>
                  <span className="text-sm font-bold mr-2">Total: </span>
                  <span className="text-sm text-red-500 font-bold">
                    GHC {totalPrice}
                  </span>
                </div>
                <div>
                  <button
                    type="submit"
                    className="w-full px-4 p-2 bg-blue-500 text-white rounded-md"
                    disabled={totalPrice === 0}
                    onClick={handleSubmitOrder}
                  >
                    Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VendorProf;
