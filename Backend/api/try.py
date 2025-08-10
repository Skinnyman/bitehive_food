import pandas as pd

meals_df = pd.read_csv("ghanaian_meals_filled_2decimals(4).csv")
print("📌 CSV Columns:", meals_df.columns.tolist())
print(meals_df.head())
