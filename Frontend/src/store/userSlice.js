import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  personalInfo: {
    age: null,
    gender: '',
    weight: null,
    height: null,
    activityLevel: '',
    dietaryPreferences: [],
    healthGoals: '',
  },
  mealPlan: null,
  progress: [],
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setPersonalInfo: (state, action) => {
      state.personalInfo = { ...state.personalInfo, ...action.payload };
    },
    setMealPlan: (state, action) => {
      state.mealPlan = action.payload;
    },
    updateProgress: (state, action) => {
      state.progress.push(action.payload);
    },
  },
});

export const { setPersonalInfo, setMealPlan, updateProgress } = userSlice.actions;
export default userSlice.reducer;
