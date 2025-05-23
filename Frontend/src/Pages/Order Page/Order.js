import React, { useEffect, useState } from 'react';
import OrderCard from '../../Components/OrderCard';
import axios from 'axios';
import { useOrder } from '../../context/OrderContext';
import { serverport } from '../../Static/Variables';

function Order() {
const { order } = useOrder();
  const [allorder,setAllOrder] = useState([])

 // console.log("Order value:", order);

  //const ordersArray = Array.isArray(order) ? order : (order ? [order] : []);
  const cusId = localStorage.getItem('id');

  const fetchOrders = async()=>{
    axios.get(`${serverport}/api/order/all?cusId=${cusId}`)
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
  useEffect(()=>{
    fetchOrders()
  })
  //console.log(allorder)
  

  return (
    <div className='relative bottom-28 grid grid-cols-1 md:grid-cols-2 gap-10 p-6'>
      {allorder.length === 0 ? (
        <div>No orders available</div>
      ) : (
        allorder.slice().reverse().map((allmeal) =>
          allmeal?.mealName
        ?.toLowerCase()
        .includes(order.toLowerCase()) &&
           (
          <OrderCard key={allmeal._id} order={allmeal} fetchOrders={fetchOrders}
          
           />
        ))
      )}
    </div>
  );
}

export default Order;
