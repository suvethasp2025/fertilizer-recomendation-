import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

def run_eda(data_path, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    
    # Load dataset
    print(f"Loading dataset from {data_path}...")
    df = pd.read_csv(data_path)
    
    # Clean column names (strip whitespace and fix typos)
    df.columns = [col.strip() for col in df.columns]
    print("Columns in dataset:", list(df.columns))
    
    # Rename columns to standard spelling if necessary
    # Standardize Temparature -> Temperature
    df = df.rename(columns={'Temparature': 'Temperature'})
    
    # Open report file
    report_path = os.path.join(output_dir, "eda_report.txt")
    with open(report_path, "w") as f:
        f.write("=== EXPLORATORY DATA ANALYSIS REPORT ===\n\n")
        f.write(f"Dataset Shape: {df.shape[0]} rows, {df.shape[1]} columns\n\n")
        
        # Info summary
        f.write("--- Data Types and Missing Values ---\n")
        missing = df.isnull().sum()
        for col in df.columns:
            f.write(f"{col}: type={df[col].dtype}, nulls={missing[col]}\n")
        f.write("\n")
        
        # Describe numerical columns
        f.write("--- Summary Statistics ---\n")
        desc = df.describe()
        f.write(desc.to_string())
        f.write("\n\n")
        
        # Unique categories
        f.write("--- Categorical Values ---\n")
        for col in df.select_dtypes(include=['object']).columns:
            f.write(f"Unique values in '{col}': {df[col].unique()}\n")
            f.write(f"Value Counts:\n{df[col].value_counts().to_string()}\n\n")
            
    print(f"Report generated at {report_path}")
    
    # Set styling
    sns.set_theme(style="whitegrid")
    
    # 1. Correlation Heatmap (only for numerical columns)
    plt.figure(figsize=(10, 8))
    numerical_cols = df.select_dtypes(include=[np.number]).columns
    corr = df[numerical_cols].corr()
    sns.heatmap(corr, annot=True, cmap="YlGnBu", fmt=".2f", linewidths=0.5)
    plt.title("Correlation Heatmap of Soil & Environmental Features", fontsize=14, pad=15)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "correlation_heatmap.png"), dpi=150)
    plt.close()
    
    # 2. Class Balance of Target (Fertilizer Name)
    plt.figure(figsize=(10, 6))
    sns.countplot(data=df, x="Fertilizer Name", hue="Fertilizer Name", palette="viridis", legend=False)
    plt.title("Distribution of Recommended Fertilizers", fontsize=14, pad=15)
    plt.xticks(rotation=45)
    plt.xlabel("Fertilizer Name")
    plt.ylabel("Count")
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "class_balance.png"), dpi=150)
    plt.close()
    
    # 3. Distribution of Numerical Features (N, P, K, Temp, Humidity, Moisture)
    fig, axes = plt.subplots(3, 2, figsize=(14, 12))
    axes = axes.flatten()
    features = ['Nitrogen', 'Potassium', 'Phosphorous', 'Temperature', 'Humidity', 'Moisture']
    
    for i, feature in enumerate(features):
        if feature in df.columns:
            sns.histplot(data=df, x=feature, kde=True, ax=axes[i], color="green" if "N" in feature else "teal")
            axes[i].set_title(f"Distribution of {feature}", fontsize=12)
            axes[i].set_xlabel("")
            axes[i].set_ylabel("Density")
            
    plt.suptitle("Soil Nutrients and Environmental Factors Distribution", fontsize=16, y=0.98)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "feature_distributions.png"), dpi=150)
    plt.close()
    
    # 4. Outlier Analysis (Boxplot)
    plt.figure(figsize=(12, 6))
    # Standardize values to see them on same scale
    df_melted = pd.melt(df[numerical_cols])
    sns.boxplot(x="variable", y="value", data=df_melted, palette="Set3")
    plt.title("Outlier Identification via Box Plots", fontsize=14, pad=15)
    plt.xticks(rotation=45)
    plt.xlabel("Features")
    plt.ylabel("Value Range")
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "outliers_boxplots.png"), dpi=150)
    plt.close()
    
    # 5. Crop Type distribution
    plt.figure(figsize=(12, 6))
    sns.countplot(data=df, x="Crop Type", hue="Crop Type", palette="crest", legend=False)
    plt.title("Distribution of Crops in Dataset", fontsize=14, pad=15)
    plt.xticks(rotation=45)
    plt.xlabel("Crop Type")
    plt.ylabel("Count")
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "crop_distribution.png"), dpi=150)
    plt.close()

    # 6. Soil Type distribution
    plt.figure(figsize=(10, 6))
    sns.countplot(data=df, x="Soil Type", hue="Soil Type", palette="rocket", legend=False)
    plt.title("Distribution of Soil Types in Dataset", fontsize=14, pad=15)
    plt.xticks(rotation=45)
    plt.xlabel("Soil Type")
    plt.ylabel("Count")
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "soil_distribution.png"), dpi=150)
    plt.close()
    
    print("EDA Visualizations saved successfully!")

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_file = os.path.join(current_dir, "data", "fertilizer_prediction.csv")
    plots_folder = os.path.join(current_dir, "plots")
    run_eda(data_file, plots_folder)
