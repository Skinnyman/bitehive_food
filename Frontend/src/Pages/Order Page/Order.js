import React, { useEffect, useState } from 'react';
import OrderCard from '../../Components/OrderCard';
import axios from 'axios';
import { serverport } from '../../Static/Variables';
import { useOrder } from '../../context/OrderContext';


function Order() {
  const [allOrders, setAllOrders] = useState([]);
  const [ordersInfo, setOrdersInfo] = useState({});
  const cusId = localStorage.getItem('id');
  const {orders} = useOrder();

  const fetchOrders = async () => {
    try {
      if (!cusId) {
        console.warn('No customer ID found in localStorage.');
        return;
      }

      console.log('Customer ID:', cusId);

      const res = await axios.get(`${serverport}/api/order/all?cusId=${cusId}`);
      const data = res.data;

      console.log('Orders Response:', data);

      // Make sure it's always an array
      const ordersArray = Array.isArray(data) ? data : (data ? [data] : []);
      setAllOrders(ordersArray);

      // Fetch delivery info for all orders in parallel
      const infoPromises = ordersArray.map(order =>
        axios
          .get(`${serverport}/api/order/getInfo?orderId=${order._id}`)
          .then(res => ({
            orderId: order._id,
            info: res.data,
          }))
          .catch(err => {
            console.error(`Failed to fetch info for order ${order._id}`, err);
            return { orderId: order._id, info: {} };
          })
      );

      const allInfo = await Promise.all(infoPromises);

      // Transform to object keyed by orderId
      const infoObj = {};
      allInfo.forEach(({ orderId, info }) => {
        infoObj[orderId] = info;
      });

      setOrdersInfo(infoObj);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setAllOrders([]);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className='relative bottom-28 grid grid-cols-1 md:grid-cols-2 gap-10 p-6'>
      {allOrders.length === 0 ? (
        <div className='text-center text-gray-500 col-span-2'>No orders available</div>
      ) : (
        allOrders.slice().reverse().map(order =>
          order?.mealName
          ?.toLowerCase()
          .includes(orders.toLowerCase()) &&
           (
          <OrderCard
            key={order._id}
            order={order}
            fetchOrders={fetchOrders}
            info={ordersInfo[order._id] || {}}
          />
        ))
      )}
    </div>
  );
}

export default Order;
