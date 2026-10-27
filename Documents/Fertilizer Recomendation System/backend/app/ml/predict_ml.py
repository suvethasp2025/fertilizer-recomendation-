import os
import joblib
import pandas as pd
import numpy as np

# Cache for loaded models
_MODEL = None
_ENCODER_PKG = None
_SCALER = None

def load_ml_assets():
    global _MODEL, _ENCODER_PKG, _SCALER
    if _MODEL is None or _ENCODER_PKG is None or _SCALER is None:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        
        model_path = os.path.join(current_dir, "model.pkl")
        encoder_path = os.path.join(current_dir, "encoder.pkl")
        scaler_path = os.path.join(current_dir, "scaler.pkl")
        
        if not (os.path.exists(model_path) and os.path.exists(encoder_path) and os.path.exists(scaler_path)):
            raise FileNotFoundError("Trained ML model assets not found. Please run train.py first.")
            
        _MODEL = joblib.load(model_path)
        _ENCODER_PKG = joblib.load(encoder_path)
        _SCALER = joblib.load(scaler_path)
        
    return _MODEL, _ENCODER_PKG, _SCALER

def predict_fertilizer(inputs: dict) -> dict:
    """
    inputs should be a dict:
    {
      'Temperature': float/int,
      'Humidity': float/int,
      'Moisture': float/int,
      'Nitrogen': float/int,
      'Potassium': float/int,
      'Phosphorous': float/int,
      'Soil Type': str,
      'Crop Type': str
    }
    """
    model, encoder_pkg, scaler = load_ml_assets()
    
    # Extract encoders
    target_encoder = encoder_pkg['target_encoder']
    cat_encoder = encoder_pkg['cat_encoder']
    categorical_cols = encoder_pkg['categorical_cols']
    numerical_cols = encoder_pkg['numerical_cols']
    
    # Create a DataFrame for the single instance
    # Ensure correct columns and values are matched
    data = {
        'Temperature': [float(inputs['Temperature'])],
        'Humidity': [float(inputs['Humidity'])],
        'Moisture': [float(inputs['Moisture'])],
        'Nitrogen': [float(inputs['Nitrogen'])],
        'Potassium': [float(inputs['Potassium'])],
        'Phosphorous': [float(inputs['Phosphorous'])],
        'Soil Type': [inputs['Soil Type']],
        'Crop Type': [inputs['Crop Type']]
    }
    df_instance = pd.DataFrame(data)
    
    # Preprocess the numerical features
    num_scaled = scaler.transform(df_instance[numerical_cols])
    
    # Preprocess the categorical features
    cat_encoded = cat_encoder.transform(df_instance[categorical_cols])
    
    # Combine numerical and categorical features (match ColumnTransformer order: numerical then categorical)
    X_processed = np.hstack([num_scaled, cat_encoded])
    
    # Run prediction
    pred_encoded = model.predict(X_processed)[0]
    pred_label = target_encoder.inverse_transform([pred_encoded])[0]
    
    # Get probabilities/confidence
    probabilities = model.predict_proba(X_processed)[0]
    confidence = probabilities[pred_encoded]
    
    # Prepare all classes probabilities
    all_probs = {target_encoder.classes_[i]: float(probabilities[i]) for i in range(len(target_encoder.classes_))}
    
    return {
        'recommended_fertilizer': pred_label,
        'confidence': float(confidence),
        'probabilities': all_probs
    }
