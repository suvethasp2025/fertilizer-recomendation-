import os
import joblib
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, OneHotEncoder, LabelEncoder
from sklearn.compose import ColumnTransformer
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix, classification_report

# Import classifiers
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC

def train_and_evaluate(data_path, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    
    # 1. Load and clean data
    print(f"Loading data from {data_path}...")
    df = pd.read_csv(data_path)
    df.columns = [col.strip() for col in df.columns]
    df = df.rename(columns={'Temparature': 'Temperature'})
    
    X = df.drop(columns=['Fertilizer Name'])
    y = df['Fertilizer Name']
    
    # Identify feature types
    categorical_cols = ['Soil Type', 'Crop Type']
    numerical_cols = ['Temperature', 'Humidity', 'Moisture', 'Nitrogen', 'Potassium', 'Phosphorous']
    
    # Fit Label Encoder for Target
    target_encoder = LabelEncoder()
    y_encoded = target_encoder.fit_transform(y)
    
    # Preprocessor for features
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numerical_cols),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_cols)
        ]
    )
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded)
    
    # Fit and transform the features
    X_train_processed = preprocessor.fit_transform(X_train)
    X_test_processed = preprocessor.transform(X_test)
    
    # Retrieve feature names for post-hoc analysis (like feature importance)
    cat_encoder = preprocessor.named_transformers_['cat']
    encoded_cat_features = list(cat_encoder.get_feature_names_out(categorical_cols))
    all_features = numerical_cols + encoded_cat_features
    
    # 2. Define Models
    models = {
        'Decision Tree': DecisionTreeClassifier(random_state=42),
        'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
        'Gradient Boosting': GradientBoostingClassifier(random_state=42),
        'KNN': KNeighborsClassifier(n_neighbors=5),
        'SVM': SVC(probability=True, random_state=42)
    }
    
    # Try adding XGBoost if installed
    try:
        from xgboost import XGBClassifier
        models['XGBoost'] = XGBClassifier(random_state=42, use_label_encoder=False, eval_metric='logloss')
        print("XGBoost is available and added to the comparison.")
    except ImportError:
        print("XGBoost is not installed. Skipping XGBoost.")
        
    results = {}
    best_accuracy = 0
    best_model_name = None
    best_model_obj = None
    
    print("\nTraining and evaluating models...")
    
    for name, model in models.items():
        # Train model
        model.fit(X_train_processed, y_train)
        
        # Predict
        y_pred = model.predict(X_test_processed)
        
        # Calculate metrics
        acc = accuracy_score(y_test, y_pred)
        precision, recall, f1, _ = precision_recall_fscore_support(y_test, y_pred, average='weighted', zero_division=0)
        
        # Cross-validation
        cv_scores = cross_val_score(model, X_train_processed, y_train, cv=5)
        cv_mean = cv_scores.mean()
        
        results[name] = {
            'Accuracy': acc,
            'Precision': precision,
            'Recall': recall,
            'F1-Score': f1,
            'CV-Accuracy': cv_mean,
            'model': model
        }
        
        print(f"{name} -> Accuracy: {acc:.4f} | F1-Score: {f1:.4f} | CV-Accuracy: {cv_mean:.4f}")
        
        # Keep track of the best model based on F1-score / Accuracy
        if acc > best_accuracy:
            best_accuracy = acc
            best_model_name = name
            best_model_obj = model
            
    print(f"\nBest Model selected: {best_model_name} with test accuracy: {best_accuracy:.4f}")
    
    # 3. Create Model Metrics Report
    metrics_file = os.path.join(output_dir, "model_metrics.txt")
    with open(metrics_file, "w") as f:
        f.write("=== MODEL TRAINING & COMPARISON REPORT ===\n\n")
        for name, metrics in results.items():
            f.write(f"--- {name} ---\n")
            f.write(f"Accuracy: {metrics['Accuracy']:.4f}\n")
            f.write(f"Precision: {metrics['Precision']:.4f}\n")
            f.write(f"Recall: {metrics['Recall']:.4f}\n")
            f.write(f"F1-Score: {metrics['F1-Score']:.4f}\n")
            f.write(f"5-Fold CV Accuracy: {metrics['CV-Accuracy']:.4f}\n\n")
            
        f.write(f"=== CLASSIFICATION REPORT FOR BEST MODEL ({best_model_name}) ===\n")
        y_pred_best = best_model_obj.predict(X_test_processed)
        f.write(classification_report(y_test, y_pred_best, target_names=target_encoder.classes_))
        
    print(f"Metrics report written to {metrics_file}")
    
    # 4. Generate Visualizations
    # Plot 1: Model Comparison Bar Chart
    plt.figure(figsize=(10, 6))
    comp_df = pd.DataFrame({
        'Model': list(results.keys()),
        'Accuracy': [m['Accuracy'] for m in results.values()],
        'CV-Accuracy': [m['CV-Accuracy'] for m in results.values()],
        'F1-Score': [m['F1-Score'] for m in results.values()]
    })
    comp_df_melted = pd.melt(comp_df, id_vars=['Model'], value_vars=['Accuracy', 'CV-Accuracy', 'F1-Score'])
    sns.barplot(data=comp_df_melted, x='Model', y='value', hue='variable', palette='viridis')
    plt.title('Model Performance Comparison', fontsize=14, pad=15)
    plt.ylabel('Score')
    plt.ylim(0, 1.05)
    plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "model_comparison.png"), dpi=150)
    plt.close()
    
    # Plot 2: Confusion Matrix for Best Model
    y_pred_best = best_model_obj.predict(X_test_processed)
    cm = confusion_matrix(y_test, y_pred_best)
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Greens",
                xticklabels=target_encoder.classes_,
                yticklabels=target_encoder.classes_)
    plt.title(f"Confusion Matrix - {best_model_name} (Best Model)", fontsize=14, pad=15)
    plt.xlabel("Predicted Label")
    plt.ylabel("True Label")
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "confusion_matrix.png"), dpi=150)
    plt.close()
    
    # Plot 3: Feature Importance (if applicable for Best Model)
    if hasattr(best_model_obj, 'feature_importances_'):
        plt.figure(figsize=(12, 8))
        importances = best_model_obj.feature_importances_
        indices = np.argsort(importances)[::-1]
        
        # Plot top 15 features
        top_n = min(15, len(all_features))
        top_indices = indices[:top_n]
        top_features = [all_features[i] for i in top_indices]
        top_importances = importances[top_indices]
        
        sns.barplot(x=top_importances, y=top_features, palette="mako")
        plt.title(f"Feature Importance - {best_model_name}", fontsize=14, pad=15)
        plt.xlabel("Relative Importance")
        plt.ylabel("Features")
        plt.tight_layout()
        plt.savefig(os.path.join(output_dir, "feature_importance.png"), dpi=150)
        plt.close()
        print("Feature importance plot generated.")
        
    # 5. Save Artifacts (model.pkl, encoder.pkl, scaler.pkl)
    # Extract numerical scaler and categorical encoder from preprocessor
    scaler = preprocessor.named_transformers_['num']
    cat_encoder = preprocessor.named_transformers_['cat']
    
    # We save three pickle files as requested
    joblib.dump(best_model_obj, os.path.join(output_dir, "model.pkl"))
    
    # Save encoder info (target encoder and feature categorical encoder)
    encoder_pkg = {
        'target_encoder': target_encoder,
        'cat_encoder': cat_encoder,
        'categorical_cols': categorical_cols,
        'numerical_cols': numerical_cols,
        'all_features': all_features
    }
    joblib.dump(encoder_pkg, os.path.join(output_dir, "encoder.pkl"))
    joblib.dump(scaler, os.path.join(output_dir, "scaler.pkl"))
    
    print("\nPickled artifacts saved:")
    print(f"- model.pkl (Trained {best_model_name})")
    print("- encoder.pkl (Categorical + Target Label Encoders)")
    print("- scaler.pkl (StandardScaler)")
    
    # Return metrics for API/Dashboard usage
    return {
        'model_name': best_model_name,
        'accuracy': float(best_accuracy),
        'precision': float(results[best_model_name]['Precision']),
        'recall': float(results[best_model_name]['Recall']),
        'f1': float(results[best_model_name]['F1-Score']),
        'cv_accuracy': float(results[best_model_name]['CV-Accuracy'])
    }

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_file = os.path.join(current_dir, "data", "fertilizer_prediction.csv")
    output_folder = current_dir
    train_and_evaluate(data_file, output_folder)
