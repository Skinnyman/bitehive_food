import React, { useEffect, useState } from 'react'
import VendorCard from '../../Components/VendorCard'
import axios from 'axios';
import { useOrder } from '../../context/OrderContext';
import { serverport } from '../../Static/Variables';
import socket from '../../Static/Socket';


function VendorInfo({onlineVendors}) {
const { orders } = useOrder(); // <-- Changed here
  const [allbuss,setAllbuss] = useState([])
  
  const fetchOrders = async()=>{
    axios.get(`${serverport}/api/vendor/allbusiness`)
    .then((res) => {
      //console.log('API response:', res.data);
      const data = res.data;
      // force it into an array if it's a single object
      if (Array.isArray(data)) {
        setAllbuss(data);
      } else {
        setAllbuss([data]); // wrap object in an array
      }
    })
    .catch((err) => {
      console.log(err);
      setAllbuss([]); // fallback on error
    });
  }
  useEffect(()=>{
    fetchOrders()
  },[])

  const vendorId = onlineVendors;
  useEffect(()=>{
    
    if (vendorId) {
      socket.emit("vendor-online", vendorId);
    }
   
  },[vendorId])
 
  return (
    
     <div className='relative bottom-28 grid grid-cols-1 md:grid-cols-2 gap-10 p-6'>
     { allbuss.length === 0 ? (
        <div>No Vendor Info available</div>
      )  : (
       allbuss.map((buss) => 
        buss?.businessName
							?.toLowerCase()
							.includes(orders.toLowerCase()) &&
        (
         
         <VendorCard key={buss._id} buss={buss} isOnline={onlineVendors.includes(buss.userId?.toString())} 
         
          />
       )
       ))
     }
   </div>
  )
}

export default VendorInfo