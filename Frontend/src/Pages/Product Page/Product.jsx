import axios from 'axios';
import React, { useState, useEffect } from 'react';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { serverport } from '../../Static/Variables';

const Product = () => {
  const user = localStorage.getItem('id');
  const [meal, setmeal] = useState([]);
 
  // it request data from the backend
  const fetchMeal = async () => {
    const userId = localStorage.getItem('id');
   //console.log(userId)
   axios.get(`${serverport}/api/meal/meal?userId=${userId}`)
   .then((res) => {
     //console.log('API response:', res.data);
     const data = res.data;
     // force it into an array if it's a single object
     if (Array.isArray(data)) {
       setmeal(data);
     } else {
       setmeal([data]); // wrap object in an array
     }
   })
   .catch((err) => {
     console.log(err);
     setmeal([]); // fallback on error
   });
  }

// the react hook useEffect refresh the browser
  useEffect(()=>{
    fetchMeal()
  },[])
  



  const [product, setProduct] = useState({
    userId: user,
    name: '',
    mealType: '',
    image: null,
    price: 0,
    chargeType: '',
    description: '',
    accompaniment: {
      name: '',
      price: 0,
      isFree: '',
    },
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'image') {
      setProduct((prev) => ({ ...prev, image: files[0] }));
    } else if (['accompanimentName', 'accompanimentPrice', 'isFree'].includes(name)) {
      setProduct((prev) => ({
        ...prev,
        accompaniment: {
          ...prev.accompaniment,
          [name === 'accompanimentName' ? 'name' : name === 'accompanimentPrice' ? 'price' : 'isFree']: value,
        },
      }));
    } else {
      setProduct((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('userId', product.userId);
    formData.append('name', product.name);
    formData.append('mealType', product.mealType);
    formData.append('image', product.image);
    formData.append('price', product.price);
    formData.append('chargeType', product.chargeType);
    formData.append('description', product.description);
    formData.append('accompaniment', JSON.stringify(product.accompaniment));

    try {
      const response = await axios.post(`${serverport}/api/meal/addmeal`, formData);
      console.log("Success:", response.data.message || "meal listing completed");
      fetchMeal(); // refresh products after add
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${serverport}/api/meal/deletemeal/${id}`);
      setmeal((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="p-6 bg-[#f4faff] min-h-screen space-y-6">
      {/* Top: Form + Preview */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Form */}
        <div className="w-full lg:w-2/3 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 bg-cyan-500 text-white rounded p-1 w-32">
            {/* <span className="bg-cyan-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">01</span> */}
            Add Product
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Product Name</label>
                <input type="text" name="name" onChange={handleChange} placeholder="Enter your product name" className="input" />
              </div>
              <div>
                <label className="block font-medium mb-1">Meal Type</label>
                <select name="mealType" onChange={handleChange} className="input">
                  <option>Select</option>
                  <option>breakfast</option>
                  <option>lunch</option>
                  <option>dinner</option>
                  <option>snack</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Product Image</label>
                <input type="file" name="image" onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="block font-medium mb-1">Price</label>
                <input type="number" name="price" onChange={handleChange} value={product.price} className="input" />
              </div>
              <div>
                <label className="block font-medium mb-1">Charge Type</label>
                <select name="chargeType" onChange={handleChange} className="input">
                  <option>Select</option>
                  <option>Quantity</option>
                  <option>Free</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Product Description</label>
                <textarea name="description" onChange={handleChange} placeholder="Enter your product description" className="input" />
              </div>
            </div>

            <div className="border p-4 rounded-lg bg-gray-50">
              <h3 className="font-semibold mb-2">Accompaniment</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Accompaniment Name</label>
                  <input type="text" name="accompanimentName" onChange={handleChange} placeholder="Enter your accompaniment name" className="input" />
                </div>
                <div>
                  <label className="block font-medium mb-1">Accompaniment Price</label>
                  <input type="number" name="accompanimentPrice" onChange={handleChange} value={product.accompaniment.price} className="input" />
                </div>
                <div>
                  <label className="block font-medium mb-1">Is Free</label>
                  <select name="isFree" onChange={handleChange} className="input">
                    <option>Select</option>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>
              </div>
            </div>

            <button type="submit" className="bg-cyan-500 text-white px-6 py-2 rounded hover:bg-cyan-600">
              Add Product
            </button>
          </form>
        </div>

        {/* Preview */}
        <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3 bg-cyan-500 text-white rounded p-1  w-32">
            {/* <span className="bg-cyan-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
              02
            </span> */}
            Preview
          </h2>

          <div className="border rounded-lg h-48 mb-4 flex items-center justify-center overflow-hidden bg-gray-100">
            {product.image ? (
              <img src={URL.createObjectURL(product.image)} alt="Product" className="h-full w-full object-cover" />
            ) : (
              <span className="text-gray-400 text-sm">No Image Selected</span>
            )}
          </div>

          <div className="space-y-2 text-sm">
            <p><strong>Product Name:</strong> {product.name || "—"}</p>
            <p><strong>Description:</strong> {product.description || "—"}</p>
            <p><strong>Meal Type:</strong> {product.mealType || "—"}</p>
            <p><strong>Price:</strong> GH₵ {product.price || 0}</p>
            <p><strong>Accompaniment Name:</strong> {product.accompaniment.name || "—"}</p>
            <p><strong>Price:</strong> GH₵ {product.accompaniment.price || 0}</p>
            <p><strong>Is free:</strong>  {product.accompaniment.isFree || "—"}</p>
          </div>
        </div>
      </div>

      {/* Product Listing at the bottom */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Product Listing</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {meal.map((meal) => (
                <div key={meal._id} className="rounded-2xl shadow-md overflow-hidden bg-white ">
                    <img src={`${serverport}/${meal.image}`} alt={meal.name} className="h-40 w-full object-cover" />
                   
                    <div className="p-4 space-y-2 text-sm">
                    <div>
                        <p className="text-gray-500">Product Name</p>
                        <p className="font-bold text-lg">{meal.name}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Description</p>
                        <p className="font-bold text-lg">{meal.description}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Price</p>
                        <p className="font-bold">GH₵ {meal.price}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Meal Type</p>
                        <p className="font-bold text-lg">{meal.mealType}</p>
                    </div>
                    </div>
                    <button
                  onClick={() => handleDelete(meal._id)}
                  className="flex items-center justify-center w-full mt-2 bg-red-500 hover:bg-red-600 text-white py-2 rounded"
                >
                  <DeleteOutlineIcon fontSize="small" className="mr-2" /> Delete
                  </button>
                </div>
                
                ))}

       
        </div>
      </div>
    </div>
  );
};

export default Product;
