import React, { useState } from 'react';
import { FaRunning, FaUtensils, FaFlag } from 'react-icons/fa';

const activityLevels = ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Extremely Active'];
const dietaryPreferences = ['Vegan', 'Vegetarian', 'Keto', 'Paleo', 'Gluten-Free', 'None'];
const healthGoals = ['Weight Loss', 'Muscle Gain', 'Maintenance', 'General Wellness'];

const DietPlannerCard = () => {
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    weight: '',
    height: '',
    activityLevel: '',
    dietaryPreferences: [],
    healthGoal: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePreference = (preference) => {
    setFormData((prev) => ({
      ...prev,
      dietaryPreferences: prev.dietaryPreferences.includes(preference)
        ? prev.dietaryPreferences.filter((p) => p !== preference)
        : [...prev.dietaryPreferences, preference],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-5xl mx-auto p-6 bg-white rounded-2xl shadow-md mt-8 border-2"
    >
      <h2 className="text-3xl font-bold text-green-700 text-center mb-6">
        Create Your Personalized Diet Plan
      </h2>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Personal Details */}
        <div>
          <div className="flex items-center mb-4">
            <FaRunning className="text-green-700 mr-2" />
            <h3 className="text-lg font-semibold">Personal Details</h3>
          </div>

          <div className="space-y-4">
            <input
              type="number"
              name="age"
              placeholder="Age *"
              value={formData.age}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
              required
            />
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
              required
            >
              <option value="">Gender *</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <input
              type="number"
              name="weight"
              placeholder="Weight (kg) *"
              value={formData.weight}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
              required
            />
            <input
              type="number"
              name="height"
              placeholder="Height (cm) *"
              value={formData.height}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
              required
            />
          </div>
        </div>

        {/* Diet Preferences */}
        <div>
          <div className="flex items-center mb-4">
            <FaUtensils className="text-green-700 mr-2" />
            <h3 className="text-lg font-semibold">Diet Preferences</h3>
          </div>

          <div className="space-y-4">
            <select
              name="activityLevel"
              value={formData.activityLevel}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
              required
            >
              <option value="">Activity Level *</option>
              {activityLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>

            <div>
              <p className="mb-2 font-medium">Dietary Preferences</p>
              <div className="flex flex-wrap gap-2">
                {dietaryPreferences.map((pref) => (
                  <button
                    type="button"
                    key={pref}
                    onClick={() => togglePreference(pref)}
                    className={`px-4 py-2 rounded-full border transition ${
                      formData.dietaryPreferences.includes(pref)
                        ? 'bg-green-700 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Health Goals */}
      <div className="mt-8">
        <div className="flex items-center mb-4">
          <FaFlag className="text-green-700 mr-2" />
          <h3 className="text-lg font-semibold">Health Goals</h3>
        </div>

        <select
          name="healthGoal"
          value={formData.healthGoal}
          onChange={handleChange}
          className="w-full border rounded-lg p-3"
          required
        >
          <option value="">Health Goal *</option>
          {healthGoals.map((goal) => (
            <option key={goal} value={goal}>
              {goal}
            </option>
          ))}
        </select>
      </div>

      {/* Submit Button */}
      <div className="mt-8 text-center">
        <button
          type="submit"
          className="bg-green-700 text-white px-10 py-3 rounded-full text-lg hover:bg-green-800 transition"
        >
          Generate Your Diet Plan
        </button>
      </div>
    </form>
  );
};

export default DietPlannerCard;
