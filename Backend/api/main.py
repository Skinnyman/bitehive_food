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
    'Dinner_Meal': joblib.load('Dinner_Meal_encoder.pkl'),
    'Snacks_Meal': joblib.load('Snacks_Meal_encoder.pkl')
}

# Calorie ranges for different snacks
SNACK_CALORIES = {
    "Atsoomo_(Chin-Chin)": (350, 450),
    "Nkatie_Cake_(Groundnut_Cake)": (300, 400),
    "Plantain_Chips": (200, 300),
    "Roasted_Plantain_with_Groundnuts": (250, 350),
    "Koose_(Bean_Cake)": (150, 250),
    "Fresh_Fruit_Salad": (100, 200),
    "Yogurt_with_Honey": (150, 250)
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

def decode_meal(probs, encoder, meal_type="other", temperature=1.0):
    """Decode meal prediction with probabilistic sampling and temperature control"""
    # Apply temperature scaling to control randomness
    scaled_probs = np.log(probs) / temperature
    exp_probs = np.exp(scaled_probs)
    final_probs = exp_probs / np.sum(exp_probs)
    
    # For snacks, use more variety
    if meal_type == "snacks":
        # Get top 3 snacks with highest probabilities
        top_indices = np.argsort(final_probs)[-3:][::-1]
        
        # Re-normalize top 3 probabilities
        top_probs = final_probs[top_indices]
        top_probs /= top_probs.sum()
        
        # Sample from top 3 snacks
        idx = np.random.choice(top_indices, p=top_probs)
    else:
        # For other meals, use standard probabilistic sampling
        idx = np.random.choice(len(final_probs), p=final_probs)
    
    if idx >= len(encoder.classes_):
        idx = len(encoder.classes_) - 1
    return encoder.inverse_transform([idx])[0]

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

@app.post("/predict", response_model=RecommendationOutput)
async def predict(user_input: UserInput):
    try:
        print(f"\n=== New Request ===\n{user_input}\n")
        
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
        
        # Print snack probabilities for debugging
        snack_probs = preds[4][0]
        top_3 = snack_probs.argsort()[-3:][::-1]
        print("Top snack probabilities:")
        for idx in top_3:
            snack = meal_encoders['Snacks_Meal'].classes_[idx]
            prob = snack_probs[idx]
            print(f"  {snack}: {prob:.4f}")
        
        # Process outputs
        numeric_out = preds[0][0]
        breakfast_meal = decode_meal(preds[1][0], meal_encoders['Breakfast_Meal'], "breakfast")
        lunch_meal = decode_meal(preds[2][0], meal_encoders['Lunch_Meal'], "lunch")
        dinner_meal = decode_meal(preds[3][0], meal_encoders['Dinner_Meal'], "dinner")
        snacks_meal = decode_meal(preds[4][0], meal_encoders['Snacks_Meal'], "snacks", temperature=1.5)
        
        # Structure the response
        result = {
            'breakfast': {
                "Calories": float(numeric_out[0]),
                "Protein_g": float(numeric_out[1]),
                "Carbs_g": float(numeric_out[2]),
                "Fats_g": float(numeric_out[3]),
                "Meal": breakfast_meal
            },
            'lunch': {
                "Calories": float(numeric_out[4]),
                "Protein_g": float(numeric_out[5]),
                "Carbs_g": float(numeric_out[6]),
                "Fats_g": float(numeric_out[7]),
                "Meal": lunch_meal
            },
            'dinner': {
                "Calories": float(numeric_out[8]),
                "Protein_g": float(numeric_out[9]),
                "Carbs_g": float(numeric_out[10]),
                "Fats_g": float(numeric_out[11]),
                "Meal": dinner_meal
            },
            'snacks': {
                "Calories": float(numeric_out[12]),
                "Protein_g": float(numeric_out[13]),
                "Carbs_g": float(numeric_out[14]),
                "Fats_g": float(numeric_out[15]),
                "Meal": snacks_meal
            }
        }
        
        # Adjust snack nutrition based on actual snack type
        if snacks_meal in SNACK_CALORIES:
            min_cal, max_cal = SNACK_CALORIES[snacks_meal]
            avg_cal = (min_cal + max_cal) / 2
            
            # Calculate adjustment factor if significant difference
            current_cal = result['snacks']['Calories']
            if abs(current_cal - avg_cal) > 50:
                adjustment_factor = avg_cal / current_cal
                result['snacks']['Calories'] = avg_cal
                result['snacks']['Protein_g'] *= adjustment_factor
                result['snacks']['Carbs_g'] *= adjustment_factor
                result['snacks']['Fats_g'] *= adjustment_factor
        
        print("\n=== Recommendation ===")
        print(f"Breakfast: {breakfast_meal}")
        print(f"Lunch: {lunch_meal}")
        print(f"Dinner: {dinner_meal}")
        print(f"Snacks: {snacks_meal}")
        
        return result

    except Exception as e:
        traceback.print_exc(file=sys.stdout)
        raise HTTPException(
            status_code=500, 
            detail=f"Internal server error: {str(e)}"
        )