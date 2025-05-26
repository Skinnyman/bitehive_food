import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './Pages/Landing Page/Landing';
import Register from './Pages/Register Page/Register';
import Login from './Pages/Login Page/Login';
import Vendor from './Pages/VendorPage/Vendor';
import Client from './Pages/Client Page/Client';
import VendorForm from './Pages/Vendor Form/VendorForm';
import VendorProf from './Pages/Vendor Profile/VendorProf';
import "mapbox-gl/dist/mapbox-gl.css";
import Favorite from './Pages/Favorite Page/Favorite';

//  Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token'); 
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const [darkmode, setdarkmode] = useState(false);
  const toggle = () => {
    setdarkmode(!darkmode);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing darkmode={darkmode} toggle={toggle} />} />
        <Route path="login" element={<Login darkmode={darkmode} toggle={toggle} />} />
        <Route path="register" element={<Register darkmode={darkmode} toggle={toggle} />} />

        {/* 🔒 Protected Routes */}
       
                <Route
                  path="vendor"
                  element={
                    <ProtectedRoute>
                 

                      <Vendor darkmode={darkmode} toggle={toggle} />
                    
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="client"
                  element={
                    <ProtectedRoute>
               

                      <Client darkmode={darkmode} toggle={toggle} />
                     
                    </ProtectedRoute>
                  }
                />
     
        <Route
          path="vendorform"
          element={
            <ProtectedRoute>
              <VendorForm darkmode={darkmode} toggle={toggle} />
            </ProtectedRoute>
          }
        />
          <Route
                  path="/vendor/:userId"
                  element={
                    <ProtectedRoute>
                    

                      <VendorProf darkmode={darkmode} toggle={toggle} />
                  
                    </ProtectedRoute>
                  }
                />
          <Route
                  path="/favorite"
                  element={
                    <ProtectedRoute>
                    
                      <Favorite darkmode={darkmode} toggle={toggle} />
                  
                    </ProtectedRoute>
                  }
                />
      </Routes>
      
    </BrowserRouter>
  );
}

export default App;
