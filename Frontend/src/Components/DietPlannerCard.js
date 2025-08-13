import React, { useState } from "react";
import { FaUser, FaWeight, FaRulerVertical, FaUtensils, FaFlag, FaFire, FaDrumstickBite, FaBreadSlice, FaEgg } from "react-icons/fa";
import { pythonserverport } from "../Static/Variables";

const MealPlannerCard = () => {
  const [formData, setFormData] = useState({
    Age: "",
    Gender: "",
    Weight_kg: "",
    Height_m: "",
    Goal: "",
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const res = await fetch(`${pythonserverport}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Age: parseFloat(formData.Age),
          Gender: formData.Gender,
          Weight_kg: parseFloat(formData.Weight_kg),
          Height_m: parseFloat(formData.Height_m),
          Goal: formData.Goal,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || `Server error: ${res.status}`);
      }
      
      const data = await res.json();
      setPrediction(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Format meal names for better display
  const formatMealName = (name) => {
    return name
      .replace(/_/g, ' ')          // change _ to space
      .replace(/\s+/g, ' ')        // replace multiple spaces with single space
      .trim();                     // trim spaces at ends
  };
  
  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-md mt-8 border-2 relative top-20"
    >
      <h2 className="text-3xl font-bold text-green-700 text-center mb-6">
         Meal Planner
      </h2>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Personal Details */}
        <div className="space-y-4">
          <div className="flex items-center mb-2">
            <FaUser className="text-green-700 mr-2" />
            <h3 className="text-lg font-semibold">Personal Details</h3>
          </div>

          <input
            type="number"
            name="Age"
            placeholder="Age *"
            value={formData.Age}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            min="1"
            max="120"
            required
          />

          <select
            name="Gender"
            value={formData.Gender}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          >
            <option value="">Gender *</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <div className="flex items-center gap-2">
            <FaWeight className="text-green-700" />
            <input
              type="number"
              name="Weight_kg"
              placeholder="Weight (kg) *"
              value={formData.Weight_kg}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
              min="30"
              max="300"
              step="0.1"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <FaRulerVertical className="text-green-700" />
            <input
              type="number"
              step="0.01"
              name="Height_m"
              placeholder="Height (m) *"
              value={formData.Height_m}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
              min="1.0"
              max="2.5"
              required
            />
          </div>
        </div>

        {/* Goal */}
        <div className="space-y-4">
          <div className="flex items-center mb-2">
            <FaFlag className="text-green-700 mr-2" />
            <h3 className="text-lg font-semibold">Goal</h3>
          </div>

          <select
            name="Goal"
            value={formData.Goal}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          >
            <option value="">Select Goal *</option>
            <option value="Weight Loss">Weight Loss</option>
            <option value="Muscle Gain">Muscle Gain</option>
          </select>
        </div>
      </div>

      {/* Submit */}
      <div className="mt-8 text-center">
        <button
          type="submit"
          disabled={loading}
          className="bg-green-700 text-white px-10 py-3 rounded-full text-lg hover:bg-green-800 transition disabled:opacity-50"
        >
          {loading ? "Predicting..." : "Get Meal Plan"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="mt-4 text-red-600 font-semibold text-center">
          Error: {error}
        </p>
      )}

      {/* Predictions */}
      {prediction && (
        <div className="mt-8">
          <div className="flex items-center mb-4 justify-center">
            <FaUtensils className="text-green-700 mr-2 text-xl" />
            <h3 className="text-xl font-bold text-green-800">
              Your Meal Plan
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Breakfast */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <h4 className="font-bold text-lg text-green-700 mb-3 flex items-center">
                <FaBreadSlice className="mr-2" />
                Breakfast: {formatMealName(prediction.breakfast.Meal)}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center">
                  <FaFire className="text-orange-500 mr-2" />
                  <span>{prediction.breakfast.Calories.toFixed(0)} Calories</span>
                </div>
                <div className="flex items-center">
                  <FaDrumstickBite className="text-amber-700 mr-2" />
                  <span>{prediction.breakfast.Protein_g.toFixed(1)}g Protein</span>
                </div>
                <div className="flex items-center">
                  <FaBreadSlice className="text-amber-500 mr-2" />
                  <span>{prediction.breakfast.Carbs_g.toFixed(1)}g Carbs</span>
                </div>
                <div className="flex items-center">
                  <FaEgg className="text-yellow-700 mr-2" />
                  <span>{prediction.breakfast.Fats_g.toFixed(1)}g Fats</span>
                </div>
              </div>
            </div>
            
            {/* Lunch */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <h4 className="font-bold text-lg text-green-700 mb-3 flex items-center">
                <FaUtensils className="mr-2" />
                Lunch: {formatMealName(prediction.lunch.Meal)}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center">
                  <FaFire className="text-orange-500 mr-2" />
                  <span>{prediction.lunch.Calories.toFixed(0)} Calories</span>
                </div>
                <div className="flex items-center">
                  <FaDrumstickBite className="text-amber-700 mr-2" />
                  <span>{prediction.lunch.Protein_g.toFixed(1)}g Protein</span>
                </div>
                <div className="flex items-center">
                  <FaBreadSlice className="text-amber-500 mr-2" />
                  <span>{prediction.lunch.Carbs_g.toFixed(1)}g Carbs</span>
                </div>
                <div className="flex items-center">
                  <FaEgg className="text-yellow-700 mr-2" />
                  <span>{prediction.lunch.Fats_g.toFixed(1)}g Fats</span>
                </div>
              </div>
            </div>
            
            {/* Dinner */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <h4 className="font-bold text-lg text-green-700 mb-3 flex items-center">
                <FaUtensils className="mr-2" />
                Dinner: {formatMealName(prediction.dinner.Meal)}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center">
                  <FaFire className="text-orange-500 mr-2" />
                  <span>{prediction.dinner.Calories.toFixed(0)} Calories</span>
                </div>
                <div className="flex items-center">
                  <FaDrumstickBite className="text-amber-700 mr-2" />
                  <span>{prediction.dinner.Protein_g.toFixed(1)}g Protein</span>
                </div>
                <div className="flex items-center">
                  <FaBreadSlice className="text-amber-500 mr-2" />
                  <span>{prediction.dinner.Carbs_g.toFixed(1)}g Carbs</span>
                </div>
                <div className="flex items-center">
                  <FaEgg className="text-yellow-700 mr-2" />
                  <span>{prediction.dinner.Fats_g.toFixed(1)}g Fats</span>
                </div>
              </div>
            </div>
            
            {/* Snacks */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <h4 className="font-bold text-lg text-green-700 mb-3 flex items-center">
                <FaUtensils className="mr-2" />
                Snacks: {formatMealName(prediction.snacks.Meal)}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center">
                  <FaFire className="text-orange-500 mr-2" />
                  <span>{prediction.snacks.Calories.toFixed(0)} Calories</span>
                </div>
                <div className="flex items-center">
                  <FaDrumstickBite className="text-amber-700 mr-2" />
                  <span>{prediction.snacks.Protein_g.toFixed(1)}g Protein</span>
                </div>
                <div className="flex items-center">
                  <FaBreadSlice className="text-amber-500 mr-2" />
                  <span>{prediction.snacks.Carbs_g.toFixed(1)}g Carbs</span>
                </div>
                <div className="flex items-center">
                  <FaEgg className="text-yellow-700 mr-2" />
                  <span>{prediction.snacks.Fats_g.toFixed(1)}g Fats</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Daily Summary */}
          <div className="mt-6 bg-green-100 border border-green-300 rounded-xl p-5">
            <h4 className="font-bold text-lg text-green-800 mb-3 text-center">
              Daily Nutrition Summary
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-700">
                  {(
                    prediction.breakfast.Calories + 
                    prediction.lunch.Calories + 
                    prediction.dinner.Calories + 
                    prediction.snacks.Calories
                  ).toFixed(0)}
                </div>
                <div className="text-gray-600">Total Calories</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-700">
                  {(
                    prediction.breakfast.Protein_g + 
                    prediction.lunch.Protein_g + 
                    prediction.dinner.Protein_g + 
                    prediction.snacks.Protein_g
                  ).toFixed(1)}g
                </div>
                <div className="text-gray-600">Total Protein</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-700">
                  {(
                    prediction.breakfast.Carbs_g + 
                    prediction.lunch.Carbs_g + 
                    prediction.dinner.Carbs_g + 
                    prediction.snacks.Carbs_g
                  ).toFixed(1)}g
                </div>
                <div className="text-gray-600">Total Carbs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-700">
                  {(
                    prediction.breakfast.Fats_g + 
                    prediction.lunch.Fats_g + 
                    prediction.dinner.Fats_g + 
                    prediction.snacks.Fats_g
                  ).toFixed(1)}g
                </div>
                <div className="text-gray-600">Total Fats</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default MealPlannerCard;