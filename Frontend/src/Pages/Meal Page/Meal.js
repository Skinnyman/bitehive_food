import React from 'react';
import MealCard from "../../Components/MealCard"
function Meal({toggle, darkmode}) {
  return (
    <div className='relative bottom-32'>
    <MealCard toggle={toggle} darkmode={darkmode} />
  </div>
  
  
  );
}

export default Meal;
