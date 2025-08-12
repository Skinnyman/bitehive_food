import numpy as np
import pandas as pd
import os
import joblib
import tensorflow as tf
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import sys
import traceback
from dotenv import load_dotenv
import random

load_dotenv()

# Load everything once at startup
model = tf.keras.models.load_model('ghanaian_meals_model.keras')
goal_encoder = joblib.load('goal_encoder.pkl')

meal_encoders = {
    'Breakfast_Meal': joblib.load('Breakfast_Meal_encoder.pkl'),
    'Lunch_Meal': joblib.load('Lunch_Meal_encoder.pkl'),
    'Dinner_Meal': joblib.load('Dinner_Meal_encoder.pkl')
}

# Enhanced meal database with accurate nutritional profiles
MEAL_DATABASE = {
    # Breakfast meals
    "Oatmeal_with_Nuts": {"Calories": 380, "Protein_g": 12, "Carbs_g": 58, "Fats_g": 12},
    "Boiled_Yam_with_Garden_Eggs_Sauce": {"Calories": 420, "Protein_g": 8, "Carbs_g": 85, "Fats_g": 7},
    "Koko_with_Koose": {"Calories": 320, "Protein_g": 11, "Carbs_g": 48, "Fats_g": 9},
    "Fried_Plantain_with_Beans": {"Calories": 550, "Protein_g": 18, "Carbs_g": 82, "Fats_g": 18},
    "Waakye_with_Fried_Fish": {"Calories": 620, "Protein_g": 28, "Carbs_g": 92, "Fats_g": 15},
    "Beans_with_Plantain": {"Calories": 480, "Protein_g": 16, "Carbs_g": 78, "Fats_g": 12},
    "Boiled_Eggs_with_Spinach": {"Calories": 180, "Protein_g": 15, "Carbs_g": 5, "Fats_g": 12},
    "Vegetable_Omlette": {"Calories": 220, "Protein_g": 18, "Carbs_g": 8, "Fats_g": 14},
    
    # Lunch meals
    "Grilled_Fish_with_Steamed_Vegetables": {"Calories": 450, "Protein_g": 35, "Carbs_g": 25, "Fats_g": 22},
    "Jollof_Rice_with_Grilled_Chicken": {"Calories": 680, "Protein_g": 42, "Carbs_g": 85, "Fats_g": 18},
    "Fufu_with_Light_Soup_and_Meat": {"Calories": 750, "Protein_g": 38, "Carbs_g": 110, "Fats_g": 15},
    "Banku_with_Tilapia": {"Calories": 820, "Protein_g": 45, "Carbs_g": 125, "Fats_g": 20},
    "Waakye_with_Grilled_Chicken": {"Calories": 650, "Protein_g": 40, "Carbs_g": 90, "Fats_g": 15},
    "Red_Red_with_Fried_Plantain": {"Calories": 580, "Protein_g": 22, "Carbs_g": 85, "Fats_g": 18},
    "Grilled_Chicken_Salad": {"Calories": 280, "Protein_g": 30, "Carbs_g": 10, "Fats_g": 14},
    "Steamed_Fish_with_Vegetables": {"Calories": 320, "Protein_g": 35, "Carbs_g": 15, "Fats_g": 12},
    
    # Dinner meals
    "Okro_Stew_with_Lean_Beef": {"Calories": 520, "Protein_g": 40, "Carbs_g": 45, "Fats_g": 20},
    "Grilled_Chicken_with_Salad": {"Calories": 480, "Protein_g": 45, "Carbs_g": 25, "Fats_g": 22},
    "Light_Soup_with_Chicken": {"Calories": 450, "Protein_g": 38, "Carbs_g": 40, "Fats_g": 18},
    "Vegetable_Stir_Fry_with_Beef": {"Calories": 490, "Protein_g": 35, "Carbs_g": 35, "Fats_g": 22},
    "Palava_Sauce_with_Fish": {"Calories": 460, "Protein_g": 32, "Carbs_g": 42, "Fats_g": 18},
    "Garden_Egg_Stew_with_Boiled_Yam": {"Calories": 480, "Protein_g": 15, "Carbs_g": 85, "Fats_g": 12},
    
    # Modified versions
    "Boiled_Plantain_with_Beans": {"Calories": 420, "Protein_g": 16, "Carbs_g": 75, "Fats_g": 10},
    "Waakye_with_Grilled_Fish": {"Calories": 520, "Protein_g": 35, "Carbs_g": 65, "Fats_g": 12},
    "Fufu_with_Light_Soup_and_Lean_Meat": {"Calories": 650, "Protein_g": 45, "Carbs_g": 95, "Fats_g": 12},
    "Banku_with_Grilled_Tilapia": {"Calories": 700, "Protein_g": 50, "Carbs_g": 100, "Fats_g": 18},
    "Jollof_Rice_with_Grilled_Chicken_and_Vegetables": {"Calories": 600, "Protein_g": 45, "Carbs_g": 75, "Fats_g": 15},
    "Oatmeal_with_Nuts_and_Protein_Powder": {"Calories": 420, "Protein_g": 25, "Carbs_g": 50, "Fats_g": 12},
    "Koko_with_Koose_and_Peanut_Butter": {"Calories": 380, "Protein_g": 16, "Carbs_g": 42, "Fats_g": 15},
    "Grilled_Fish_with_Steamed_Vegetables_and_Eggs": {"Calories": 520, "Protein_g": 45, "Carbs_g": 25, "Fats_g": 28}
}

# Default nutritional profile if meal not found in database
DEFAULT_MEAL_PROFILE = {"Calories": 500, "Protein_g": 25, "Carbs_g": 60, "Fats_g": 15}

# Calorie ranges for different meals (updated for accuracy)
MEAL_CALORIES = {
    "breakfast": (300, 500),
    "lunch": (450, 750),
    "dinner": (400, 650),
    "snacks": (150, 300)
}

# Protein ranges for different meals (updated for accuracy)
MEAL_PROTEIN = {
    "breakfast": (10, 30),
    "lunch": (20, 50),
    "dinner": (20, 45),
    "snacks": (5, 15)
}

# Enhanced snack nutrition profiles for different goals
SNACK_NUTRITION = {
    "Weight Loss": [
        {"Meal": "Fresh Fruit Salad", "Calories": 120, "Protein_g": 2, "Carbs_g": 28, "Fats_g": 0.3},
        {"Meal": "Greek Yogurt with Berries", "Calories": 100, "Protein_g": 12, "Carbs_g": 10, "Fats_g": 2},
        {"Meal": "Vegetable Sticks with Hummus", "Calories": 150, "Protein_g": 6, "Carbs_g": 15, "Fats_g": 8},
        {"Meal": "Boiled Eggs (2)", "Calories": 140, "Protein_g": 12, "Carbs_g": 1, "Fats_g": 10}
    ],
    "Muscle Gain": [
        {"Meal": "Protein Shake", "Calories": 200, "Protein_g": 30, "Carbs_g": 15, "Fats_g": 5},
        {"Meal": "Koose with Peanut Butter", "Calories": 280, "Protein_g": 12, "Carbs_g": 25, "Fats_g": 15},
        {"Meal": "Roasted Plantain with Groundnuts", "Calories": 320, "Protein_g": 8, "Carbs_g": 40, "Fats_g": 15}
    ],
    "Maintain Weight": [
        {"Meal": "Nkatie Cake (Groundnut Cake)", "Calories": 180, "Protein_g": 6, "Carbs_g": 15, "Fats_g": 12},
        {"Meal": "Plantain Chips (Small)", "Calories": 200, "Protein_g": 2, "Carbs_g": 25, "Fats_g": 10},
        {"Meal": "Yogurt with Granola", "Calories": 180, "Protein_g": 8, "Carbs_g": 25, "Fats_g": 5}
    ],
    "Healthy Eating": [
        {"Meal": "Fresh Fruit Salad", "Calories": 150, "Protein_g": 2, "Carbs_g": 35, "Fats_g": 0.5},
        {"Meal": "Vegetable Sticks with Hummus", "Calories": 160, "Protein_g": 5, "Carbs_g": 15, "Fats_g": 10},
        {"Meal": "Boiled Eggs with Avocado", "Calories": 220, "Protein_g": 10, "Carbs_g": 8, "Fats_g": 18}
    ]
}

# Enhanced goal-based meal preferences
GOAL_MEAL_PREFERENCES = {
    "Weight Loss": {
        "preferred": {
            "Breakfast_Meal": ["Oatmeal_with_Nuts", "Boiled_Eggs_with_Spinach", "Vegetable_Omlette"],
            "Lunch_Meal": ["Grilled_Fish_with_Steamed_Vegetables", "Steamed_Fish_with_Vegetables", "Grilled_Chicken_Salad"],
            "Dinner_Meal": ["Okro_Stew_with_Lean_Beef", "Grilled_Fish_with_Steamed_Vegetables", "Vegetable_Stir_Fry_with_Beef"]
        },
        "avoid": {
            "Breakfast_Meal": ["Fried_Plantain_with_Beans", "Waakye_with_Fried_Fish"],
            "Lunch_Meal": ["Fufu_with_Light_Soup_and_Meat", "Banku_with_Tilapia", "Jollof_Rice_with_Grilled_Chicken"],
            "Dinner_Meal": ["Fufu_with_Light_Soup_and_Meat", "Banku_with_Tilapia", "Red_Red_with_Fried_Plantain"]
        }
    },
    "Muscle Gain": {
        "preferred": {
            "Breakfast_Meal": ["Waakye_with_Fried_Fish", "Beans_with_Plantain"],
            "Lunch_Meal": ["Fufu_with_Light_Soup_and_Meat", "Banku_with_Tilapia"],
            "Dinner_Meal": ["Fufu_with_Light_Soup_and_Meat", "Banku_with_Tilapia"]
        },
        "avoid": {
            "Breakfast_Meal": ["Koko_with_Koose", "Oatmeal_with_Nuts"],
            "Lunch_Meal": ["Grilled_Fish_with_Steamed_Vegetables"],
            "Dinner_Meal": ["Grilled_Fish_with_Steamed_Vegetables"]
        }
    },
    "Maintain Weight": {
        "preferred": {
            "Breakfast_Meal": ["Oatmeal_with_Nuts", "Boiled_Yam_with_Garden_Eggs_Sauce"],
            "Lunch_Meal": ["Jollof_Rice_with_Grilled_Chicken", "Waakye_with_Fried_Fish"],
            "Dinner_Meal": ["Okro_Stew_with_Lean_Beef", "Grilled_Fish_with_Steamed_Vegetables"]
        },
        "avoid": {}
    },
    "Healthy Eating": {
        "preferred": {
            "Breakfast_Meal": ["Oatmeal_with_Nuts", "Boiled_Yam_with_Garden_Eggs_Sauce"],
            "Lunch_Meal": ["Grilled_Fish_with_Steamed_Vegetables", "Jollof_Rice_with_Grilled_Chicken"],
            "Dinner_Meal": ["Okro_Stew_with_Lean_Beef", "Grilled_Fish_with_Steamed_Vegetables"]
        },
        "avoid": {
            "Breakfast_Meal": ["Fried_Plantain_with_Beans"],
            "Lunch_Meal": [],
            "Dinner_Meal": []
        }
    }
}

# Define meal modifications based on goals
MEAL_MODIFICATIONS = {
    "Weight Loss": {
        "Fried_Plantain_with_Beans": "Boiled_Plantain_with_Beans",
        "Waakye_with_Fried_Fish": "Waakye_with_Grilled_Fish",
        "Fufu_with_Light_Soup_and_Meat": "Fufu_with_Light_Soup_and_Lean_Meat",
        "Banku_with_Tilapia": "Banku_with_Grilled_Tilapia",
        "Jollof_Rice_with_Grilled_Chicken": "Jollof_Rice_with_Grilled_Chicken_and_Vegetables",
        "default_additions": {
            "breakfast": "with extra vegetables",
            "lunch": "with steamed vegetables",
            "dinner": "with garden egg sauce"
        }
    },
    "Muscle Gain": {
        "Oatmeal_with_Nuts": "Oatmeal_with_Nuts_and_Protein_Powder",
        "Koko_with_Koose": "Koko_with_Koose_and_Peanut_Butter",
        "Grilled_Fish_with_Steamed_Vegetables": "Grilled_Fish_with_Steamed_Vegetables_and_Eggs",
        "default_additions": {
            "breakfast": "with extra eggs",
            "lunch": "with extra lean meat",
            "dinner": "with extra fish"
        }
    },
    "Healthy Eating": {
        "Fried_Plantain_with_Beans": "Boiled_Plantain_with_Beans",
        "Jollof_Rice_with_Grilled_Chicken": "Jollof_Rice_with_Grilled_Chicken_and_Vegetables",
        "Waakye_with_Fried_Fish": "Waakye_with_Grilled_Fish",
        "default_additions": {
            "breakfast": "with fresh fruit",
            "lunch": "with salad",
            "dinner": "with steamed vegetables"
        }
    },
    "Maintain Weight": {
        "default_additions": {
            "breakfast": "with fresh fruit",
            "lunch": "with garden egg sauce",
            "dinner": "with salad"
        }
    }
}

# Get feature ranges for manual normalization
feature_ranges = {
    'Age': (18, 80),
    'Weight_kg': (45, 120),
    'Height_m': (1.5, 2.0),
    'Gender': (0, 1),
    'Goal_encoded': (0, len(goal_encoder.classes_)-1)
}

# FastAPI setup
app = FastAPI()

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "BiteHive API is running!"}

class UserInput(BaseModel):
    Age: int
    Gender: str  # "Male" or "Female"
    Weight_kg: float
    Height_m: float
    Goal: str

class MealRecommendation(BaseModel):
    Calories: float
    Protein_g: float
    Carbs_g: float
    Fats_g: float
    Meal: str

class RecommendationOutput(BaseModel):
    breakfast: MealRecommendation
    lunch: MealRecommendation
    dinner: MealRecommendation
    snacks: MealRecommendation

def get_meal_nutrition(meal_name):
    """Get verified nutritional values from database or use default"""
    # First try exact match
    if meal_name in MEAL_DATABASE:
        return MEAL_DATABASE[meal_name]
    
    # Try base meal name if modified version not found
    base_name = meal_name.split(" with ")[0]
    if base_name in MEAL_DATABASE:
        return MEAL_DATABASE[base_name]
    
    # Log missing meals for debugging
    print(f"Warning: Meal '{meal_name}' not found in database. Using default profile.")
    return DEFAULT_MEAL_PROFILE

def get_goal_specific_snack(goal):
    """Select a random snack appropriate for the user's goal"""
    snacks = SNACK_NUTRITION.get(goal, [])
    if not snacks:
        return {"Meal": "Fresh Fruit Salad", "Calories": 150, "Protein_g": 2, "Carbs_g": 35, "Fats_g": 0.5}
    return random.choice(snacks)

def modify_meal_for_goal(meal_name, meal_type, goal):
    """Modify meal name based on goal-specific rules"""
    if goal not in MEAL_MODIFICATIONS:
        return meal_name
    
    modifications = MEAL_MODIFICATIONS[goal]
    
    # 1. Check for direct substitutions
    if meal_name in modifications:
        modified_meal = modifications[meal_name]
        print(f"Substituted {meal_name} with {modified_meal} for {goal}")
        return modified_meal
    
    # 2. Check for additions
    if "default_additions" in modifications:
        addition = modifications["default_additions"].get(meal_type, "")
        if addition:
            modified_meal = f"{meal_name} {addition}"
            print(f"Added '{addition}' to {meal_name} for {goal}")
            return modified_meal
    
    # 3. Return original if no modifications apply
    return meal_name

def adjust_probs_for_goal(probs, encoder, goal, meal_category):
    """Adjust probabilities based on goal preferences"""
    if goal not in GOAL_MEAL_PREFERENCES:
        return probs
    
    preferences = GOAL_MEAL_PREFERENCES[goal]
    classes = encoder.classes_
    adjusted_probs = probs.copy()
    
    # Boost preferred meals
    if meal_category in preferences["preferred"]:
        for meal in preferences["preferred"][meal_category]:
            if meal in classes:
                idx = np.where(classes == meal)[0]
                if len(idx) > 0:
                    adjusted_probs[idx[0]] *= 2.0  # Boost probability
    
    # Reduce avoided meals
    if meal_category in preferences["avoid"]:
        for meal in preferences["avoid"][meal_category]:
            if meal in classes:
                idx = np.where(classes == meal)[0]
                if len(idx) > 0:
                    adjusted_probs[idx[0]] *= 0.2  # Reduce probability
    
    # Normalize probabilities
    if np.sum(adjusted_probs) > 0:
        adjusted_probs /= np.sum(adjusted_probs)
    else:
        adjusted_probs = probs  # Fallback to original if all probs become zero
    
    return adjusted_probs

def decode_meal(probs, encoder, meal_type="other", goal=None, temperature=1.0):
    """Decode meal prediction with goal-based adjustments"""
    # Apply goal-based adjustments
    if goal:
        meal_category = {
            "breakfast": "Breakfast_Meal",
            "lunch": "Lunch_Meal",
            "dinner": "Dinner_Meal"
        }.get(meal_type, "Breakfast_Meal")
        
        probs = adjust_probs_for_goal(probs, encoder, goal, meal_category)
    
    # Apply temperature scaling
    scaled_probs = np.log(probs) / temperature
    exp_probs = np.exp(scaled_probs)
    final_probs = exp_probs / np.sum(exp_probs)
    
    # Use standard probabilistic sampling
    idx = np.random.choice(len(final_probs), p=final_probs)
    
    if idx >= len(encoder.classes_):
        idx = len(encoder.classes_) - 1
    
    meal_name = encoder.inverse_transform([idx])[0]
    return meal_name

def get_weight_loss_meal(meal_type, goal, encoder):
    """Select a meal specifically optimized for weight loss goals with variety"""
    category = {
        "breakfast": "Breakfast_Meal",
        "lunch": "Lunch_Meal",
        "dinner": "Dinner_Meal"
    }[meal_type]
    
    # Get preferred meals for weight loss
    preferred = GOAL_MEAL_PREFERENCES[goal]["preferred"].get(category, [])
    
    # Filter to meals actually in our database
    valid_meals = [meal for meal in preferred if meal in MEAL_DATABASE]
    
    if valid_meals:
        # Sort by calories (ascending) but keep variety
        valid_meals.sort(key=lambda x: MEAL_DATABASE[x]["Calories"])
        
        # Return top 3 lowest calorie options for variety
        return valid_meals[:3]
    
    # Fallback to original decoding if no preferred meals
    probs = np.ones(len(encoder.classes_)) / len(encoder.classes_)
    return [decode_meal(probs, encoder, meal_type, goal)]

def manual_normalize(features):
    """Manually normalize features to [0,1] range"""
    normalized = []
    for name, value in features.items():
        min_val, max_val = feature_ranges[name]
        # Clip values to range
        clipped = max(min_val, min(value, max_val))
        # Normalize
        normalized.append((clipped - min_val) / (max_val - min_val))
    return np.array([normalized], dtype=np.float32)

def calculate_nutritional_needs(weight, height, age, gender, goal):
    """Calculate accurate nutritional needs based on user profile"""
    # Calculate BMR using Mifflin-St Jeor Equation
    height_cm = height * 100
    if gender == "Male":
        bmr = 10 * weight + 6.25 * height_cm - 5 * age + 5
    else:
        bmr = 10 * weight + 6.25 * height_cm - 5 * age - 161
    
    # Adjust for activity level (assume moderately active)
    tdee = bmr * 1.55
    
    # Adjust for goals
    if goal == "Muscle Gain":
        target_calories = tdee * 1.15  # 15% surplus
        protein_multiplier = 2.2
    elif goal == "Weight Loss":
        target_calories = tdee * 0.85  # 15% deficit
        protein_multiplier = 2.0
    else:  # Maintenance or Healthy
        target_calories = tdee
        protein_multiplier = 1.8
    
    # Macronutrient targets
    protein_g = weight * protein_multiplier
    protein_cal = protein_g * 4
    fat_cal = target_calories * 0.25  # 25% of calories from fat
    fat_g = fat_cal / 9
    carb_cal = target_calories - protein_cal - fat_cal
    carb_g = carb_cal / 4
    
    return {
        "calories": target_calories,
        "protein_g": protein_g,
        "carbs_g": carb_g,
        "fats_g": fat_g
    }

def validate_and_correct_meal(meal_type, meal_data, actual_needs, goal):
    """Validate and correct unrealistic nutritional values for a meal"""
    meal_name = meal_data["Meal"]
    
    # Lookup strategy: try exact name, then base name
    if meal_name in MEAL_DATABASE:
        verified_profile = MEAL_DATABASE[meal_name]
    else:
        base_meal = meal_name.split(" with ")[0]
        verified_profile = MEAL_DATABASE.get(base_meal, DEFAULT_MEAL_PROFILE)
        if base_meal not in MEAL_DATABASE:
            print(f"Warning: Base meal '{base_meal}' not found for '{meal_name}'")

    # Adjust portion size to meet calorie targets
    calorie_target = (MEAL_CALORIES[meal_type][0] + MEAL_CALORIES[meal_type][1]) / 2
    portion_factor = calorie_target / verified_profile["Calories"]
    
    # Apply portion adjustment to all nutrients
    adjusted_profile = {}
    for nutrient, value in verified_profile.items():
        adjusted_profile[nutrient] = value * portion_factor
    
    # Ensure we're within meal-specific ranges
    min_cal, max_cal = MEAL_CALORIES[meal_type]
    min_pro, max_pro = MEAL_PROTEIN[meal_type]
    
    # Calorie adjustment
    if adjusted_profile["Calories"] < min_cal:
        adjustment = min_cal / adjusted_profile["Calories"]
        for nutrient in adjusted_profile:
            adjusted_profile[nutrient] *= adjustment
    elif adjusted_profile["Calories"] > max_cal:
        adjustment = max_cal / adjusted_profile["Calories"]
        for nutrient in adjusted_profile:
            adjusted_profile[nutrient] *= adjustment
    
    # Protein adjustment
    if adjusted_profile["Protein_g"] < min_pro:
        protein_deficit = min_pro - adjusted_profile["Protein_g"]
        adjusted_profile["Protein_g"] = min_pro
        # Adjust carbs down to compensate for protein increase
        adjusted_profile["Carbs_g"] -= protein_deficit * 4 / 4  # Protein has 4 cal/g
    elif adjusted_profile["Protein_g"] > max_pro:
        protein_surplus = adjusted_profile["Protein_g"] - max_pro
        adjusted_profile["Protein_g"] = max_pro
        # Adjust carbs up to compensate for protein decrease
        adjusted_profile["Carbs_g"] += protein_surplus * 4 / 4
    
    # Special adjustments for weight loss
    if goal == "Weight Loss":
        # Reduce calories by an additional 10%
        if "Calories" in adjusted_profile:
            adjusted_profile["Calories"] *= 0.9
            
        # Increase protein content
        if "Protein_g" in adjusted_profile:
            adjusted_profile["Protein_g"] *= 1.2
            
        # Reduce carbs and fats
        if "Carbs_g" in adjusted_profile:
            adjusted_profile["Carbs_g"] *= 0.85
        if "Fats_g" in adjusted_profile:
            adjusted_profile["Fats_g"] *= 0.85
    
    return {
        "Meal": meal_name,
        "Calories": adjusted_profile["Calories"],
        "Protein_g": adjusted_profile["Protein_g"],
        "Carbs_g": adjusted_profile["Carbs_g"],
        "Fats_g": adjusted_profile["Fats_g"]
    }

def scale_nutrition(prediction, actual_needs, goal):
    """Scale nutrition to match calculated needs with validation checks"""
    # Calculate totals from prediction (only breakfast, lunch, dinner)
    total_calories = (
        prediction['breakfast']['Calories'] +
        prediction['lunch']['Calories'] +
        prediction['dinner']['Calories']
    )
    
    # Calculate scaling factor
    calorie_scale = actual_needs['calories'] / total_calories
    
    # Scale all meals proportionally
    for meal in ['breakfast', 'lunch', 'dinner']:
        for nutrient in ['Calories', 'Protein_g', 'Carbs_g', 'Fats_g']:
            prediction[meal][nutrient] *= calorie_scale
    
    # Ensure protein minimum is met
    total_protein = (
        prediction['breakfast']['Protein_g'] +
        prediction['lunch']['Protein_g'] +
        prediction['dinner']['Protein_g']
    )
    
    if total_protein < actual_needs['protein_g']:
        # Add protein boost to main meals
        protein_deficit = actual_needs['protein_g'] - total_protein
        for meal in ['breakfast', 'lunch', 'dinner']:
            prediction[meal]['Protein_g'] += protein_deficit / 3
            # Adjust carbs down to compensate
            prediction[meal]['Carbs_g'] -= (protein_deficit / 3) * 4 / 4
    
    # Validate and correct each meal
    for meal_type in ['breakfast', 'lunch', 'dinner']:
        prediction[meal_type] = validate_and_correct_meal(
            meal_type, 
            prediction[meal_type],
            actual_needs,
            goal
        )
    
    return prediction

@app.post("/predict", response_model=RecommendationOutput)
async def predict(user_input: UserInput):
    try:
        print(f"\n=== New Request ===\n{user_input}\n")
        
        # Calculate actual nutritional needs
        actual_needs = calculate_nutritional_needs(
            weight=user_input.Weight_kg,
            height=user_input.Height_m,
            age=user_input.Age,
            gender=user_input.Gender,
            goal=user_input.Goal
        )
        print(f"Calculated Needs: {actual_needs}")
        
        # Manual feature engineering
        features = {
            'Age': user_input.Age,
            'Gender': 0 if user_input.Gender == 'Male' else 1,
            'Weight_kg': user_input.Weight_kg,
            'Height_m': user_input.Height_m,
            'Goal_encoded': goal_encoder.transform([user_input.Goal])[0]
        }
        
        # Manual normalization
        X_processed = manual_normalize(features)
        print(f"Processed features: {X_processed}")
        
        # Make prediction
        preds = model.predict(X_processed)
        
        # Process outputs with goal-based adjustments
        if user_input.Goal == "Weight Loss":
            # Get top 3 options for each meal type
            breakfast_options = get_weight_loss_meal("breakfast", user_input.Goal, meal_encoders['Breakfast_Meal'])
            lunch_options = get_weight_loss_meal("lunch", user_input.Goal, meal_encoders['Lunch_Meal'])
            dinner_options = get_weight_loss_meal("dinner", user_input.Goal, meal_encoders['Dinner_Meal'])
            
            # Randomly select one from each list
            breakfast_meal = random.choice(breakfast_options)
            lunch_meal = random.choice(lunch_options)
            dinner_meal = random.choice(dinner_options)
        else:
            # Original method for other goals
            breakfast_meal = decode_meal(
                preds[1][0], 
                meal_encoders['Breakfast_Meal'], 
                "breakfast",
                goal=user_input.Goal
            )
            lunch_meal = decode_meal(
                preds[2][0], 
                meal_encoders['Lunch_Meal'], 
                "lunch",
                goal=user_input.Goal
            )
            dinner_meal = decode_meal(
                preds[3][0], 
                meal_encoders['Dinner_Meal'], 
                "dinner",
                goal=user_input.Goal
            )
        
        # Apply meal modifications based on goal
        breakfast_meal = modify_meal_for_goal(breakfast_meal, "breakfast", user_input.Goal)
        lunch_meal = modify_meal_for_goal(lunch_meal, "lunch", user_input.Goal)
        dinner_meal = modify_meal_for_goal(dinner_meal, "dinner", user_input.Goal)
        
        # Structure the response with meal names
        result = {
            'breakfast': {
                "Meal": breakfast_meal
            },
            'lunch': {
                "Meal": lunch_meal
            },
            'dinner': {
                "Meal": dinner_meal
            }
        }
        
        # Add initial nutrition values
        for meal_type in ['breakfast', 'lunch', 'dinner']:
            meal_name = result[meal_type]["Meal"]
            nutrition = get_meal_nutrition(meal_name)
            result[meal_type] = {
                **nutrition,
                "Meal": meal_name
            }
        
        # Scale and validate nutrition to match calculated needs
        result = scale_nutrition(result, actual_needs, user_input.Goal)
        
        # Add goal-specific snack
        snack = get_goal_specific_snack(user_input.Goal)
        result['snacks'] = snack
        
        # Calculate and log totals (including snack)
        total_calories = sum(result[meal]['Calories'] for meal in result)
        total_protein = sum(result[meal]['Protein_g'] for meal in result)
        total_carbs = sum(result[meal]['Carbs_g'] for meal in result)
        total_fats = sum(result[meal]['Fats_g'] for meal in result)
        
        print("\n=== Final Recommendation ===")
        print(f"Total Calories: {total_calories:.1f} (Target: {actual_needs['calories']:.1f})")
        print(f"Total Protein: {total_protein:.1f}g (Target: {actual_needs['protein_g']:.1f}g)")
        print(f"Total Carbs: {total_carbs:.1f}g (Target: {actual_needs['carbs_g']:.1f}g)")
        print(f"Total Fats: {total_fats:.1f}g (Target: {actual_needs['fats_g']:.1f}g)")
        
        return result

    except Exception as e:
        traceback.print_exc(file=sys.stdout)
        raise HTTPException(
            status_code=500, 
            detail=f"Internal server error: {str(e)}"
        )
    
if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))  # Use Render's port or 8000 as fallback
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=port)