from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime
from bson import ObjectId

from backend.app.models import PredictionRequest, PredictionResponse, FertilizerExplanation
from backend.app.database import predictions_collection, users_collection
from backend.app.auth import get_current_user
from backend.app.ml.predict_ml import predict_fertilizer

router = APIRouter(prefix="/api", tags=["Prediction"])

# Detailed fertilizer descriptions and explanations
FERTILIZER_DATABASE = {
    "Urea": {
        "why_this": "Urea is the most concentrated nitrogenous fertilizer, containing 46% Nitrogen. Your soil requires a massive boost in Nitrogen to support healthy, green leaf growth and stems for your chosen crop.",
        "application_method": "Top-dressing or broadcasting. Apply evenly over the soil surface, preferably before rain or irrigation, to minimize nitrogen loss from ammonia volatilization.",
        "advantages": [
            "Highly soluble in water, making it quickly available to plants.",
            "Contains a high concentration of nitrogen (46%), reducing transport and handling costs.",
            "Promotes rapid vegetative growth and increases crop yields."
        ],
        "disadvantages": [
            "Can cause seed burn if placed in direct contact with seeds.",
            "Subject to high volatilization losses if not incorporated into the soil quickly.",
            "Over-application leads to excessive foliage and increases susceptibility to pests."
        ],
        "npk_ratio": "46-0-0",
        "organic_alternatives": [
            "Well-composted chicken manure (high in nitrogen).",
            "Blood meal or alfalfa meal.",
            "Cover crops like legumes (clover, vetch) to fix nitrogen naturally."
        ],
        "safety_tips": [
            "Wear gloves and protective eyewear during handling to avoid skin irritation.",
            "Store in a cool, dry, well-ventilated space; keep bags sealed as it absorbs moisture easily.",
            "Avoid breathing in dust from the granules."
        ]
    },
    "DAP": {
        "why_this": "DAP (Diammonium Phosphate) provides an excellent source of Phosphorus (46%) and Nitrogen (18%). This is ideal for early stage crop development, root establishment, and seeding growth where phosphorus demand is high.",
        "application_method": "Band placement. Apply in bands 2-3 inches to the side and below the seed row to prevent seedling damage while placing nutrients within reach of roots.",
        "advantages": [
            "Provides both Nitrogen and Phosphorus in a single granulate.",
            "Highly soluble, releasing nutrients quickly for root uptake.",
            "Has an acidifying effect on alkaline soils, improving minor nutrient availability."
        ],
        "disadvantages": [
            "Can temporarily release toxic ammonia gas around the granule, which damages germinating seeds.",
            "High phosphorus can bind with zinc, causing zinc deficiencies in some soils.",
            "Not suitable for soils that are already highly acidic."
        ],
        "npk_ratio": "18-46-0",
        "organic_alternatives": [
            "Bone meal (rich source of phosphorus).",
            "Rock phosphate.",
            "Bat guano."
        ],
        "safety_tips": [
            "Wash hands thoroughly after application.",
            "Avoid dusting in strong winds.",
            "Keep out of reach of livestock, as concentrated ingestion can be harmful."
        ]
    },
    "14-35-14": {
        "why_this": "14-35-14 is a compound NPK fertilizer with high phosphorus and moderate nitrogen and potassium. It is perfect for soils with low phosphorus levels that still require balanced N and K inputs for overall crop strength.",
        "application_method": "Basal application during sowing or planting. Mix well with the soil to ensure nutrients are distributed near the developing roots.",
        "advantages": [
            "High phosphorus concentration (35%) supports robust root development.",
            "Balanced nitrogen and potassium maintain overall plant immunity.",
            "Granular form ensures slow and steady nutrient release."
        ],
        "disadvantages": [
            "Slightly expensive compared to straight single-nutrient fertilizers.",
            "Can lead to phosphorus accumulation in the soil if used repeatedly without testing."
        ],
        "npk_ratio": "14-35-14",
        "organic_alternatives": [
            "Combination of bone meal (for P), wood ash (for K), and compost (for N).",
            "Fish emulsion."
        ],
        "safety_tips": [
            "Use safety masks in dry conditions to avoid inhaling fine fertilizer particles.",
            "Store away from chemicals and acidic substances."
        ]
    },
    "28-28": {
        "why_this": "28-28 (28-28-0) provides a high and equal ratio of Nitrogen and Phosphorus. It is recommended for soils lacking both nitrogen and phosphorus, particularly for cereal crops and during rapid growth phases.",
        "application_method": "Split application. Apply half during planting as a basal dose and the remaining half 4-6 weeks later as top dressing.",
        "advantages": [
            "Highly effective for wheat, maize, and paddy fields.",
            "Stimulates both foliage growth and strong root systems simultaneously.",
            "Granules dissolve easily in damp soil."
        ],
        "disadvantages": [
            "Contains no Potassium (K); prolonged use may deplete soil potassium.",
            "Possibility of nitrogen leaching in sandy soils."
        ],
        "npk_ratio": "28-28-0",
        "organic_alternatives": [
            "Mix of compost, well-rotted manure, and kelp meal.",
            "Green manure combined with rock phosphate."
        ],
        "safety_tips": [
            "Store in a dry location to prevent clumping.",
            "Wear gloves and protective boots during field application."
        ]
    },
    "17-17-17": {
        "why_this": "17-17-17 is a fully balanced, multi-nutrient fertilizer containing equal parts Nitrogen, Phosphorus, and Potassium. It is ideal for general-purpose maintenance and crops requiring uniform nutritional support throughout their lifecycle.",
        "application_method": "Broadcasting or side-dressing. Distribute evenly around the base of the crop, keeping a distance of 3-4 inches from the stem.",
        "advantages": [
            "Provides a complete nutritional profile (N-P-K) in every granule.",
            "Maintains soil nutrient balance and prevents crop nutrient deficiency.",
            "Increases yield, fruit size, quality, and shelf life."
        ],
        "disadvantages": [
            "May deliver nutrients that the soil already has in abundance, leading to waste.",
            "Higher cost per unit of nutrient compared to single fertilizers."
        ],
        "npk_ratio": "17-17-17",
        "organic_alternatives": [
            "All-purpose organic compost.",
            "Vermicompost (worm castings).",
            "Kelp meal mixed with poultry manure."
        ],
        "safety_tips": [
            "Wash any exposed skin after handling.",
            "Apply in the early morning or late evening to prevent leaf burn."
        ]
    },
    "20-20": {
        "why_this": "20-20 (20-20-0) is an ammonium phosphate sulfate compound. It delivers equal portions of Nitrogen and Phosphorus alongside Sulfur, which improves crop protein production and oil synthesis.",
        "application_method": "Basal dressing or side dressing. Incorporate into the top 2 inches of soil for maximum nutrient efficiency.",
        "advantages": [
            "Excellent for oilseeds, pulses, and grain crops.",
            "Sulfur content improves nitrogen uptake and chlorophyll formation.",
            "Extremely stable and less prone to leaching."
        ],
        "disadvantages": [
            "Lacks Potassium; if potassium levels in your soil are low, you will need secondary supplementation."
        ],
        "npk_ratio": "20-20-0",
        "organic_alternatives": [
            "Compost tea.",
            "Feather meal mixed with bone meal."
        ],
        "safety_tips": [
            "Keep bags stored off the ground on wooden pallets to avoid moisture absorption.",
            "Avoid contact with cuts or open wounds."
        ]
    },
    "10-26-26": {
        "why_this": "10-26-26 is a potash-rich complex fertilizer with high levels of Phosphorus and Potassium. It is recommended for root and tuber crops, and for increasing disease resistance, drought tolerance, and quality of grain/fruits.",
        "application_method": "Basal application at sowing or transplanting. Apply close to root zones to ensure potassium and phosphorus are active when the plant matures.",
        "advantages": [
            "High potassium level (26%) improves plant resistance to stress, drought, and pests.",
            "Excellent for crops like potatoes, groundnuts, sugar beet, and fruit trees.",
            "Improves water-use efficiency of crops."
        ],
        "disadvantages": [
            "Low nitrogen content; vegetative growth might be limited unless supplemented with a nitrogen source during the growing phase."
        ],
        "npk_ratio": "10-26-26",
        "organic_alternatives": [
            "Greensand or potassium sulfate (natural mineral potash).",
            "Wood ash (rich in potassium and calcium).",
            "Bone meal mixed with banana peel compost."
        ],
        "safety_tips": [
            "Wear masks to avoid dust inhalation.",
            "Store in a cool, well-ventilated dry space away from open fire."
        ]
    }
}

@router.post("/predict", response_model=PredictionResponse)
async def predict(req: PredictionRequest, current_user: dict = Depends(get_current_user)):
    """
    Predict the best fertilizer using the trained machine learning model.
    Saves the prediction history and increments user stats.
    """
    try:
        # Run ML model prediction
        inputs_dict = {
            "Temperature": req.temperature,
            "Humidity": req.humidity,
            "Moisture": req.moisture,
            "Nitrogen": req.nitrogen,
            "Potassium": req.potassium,
            "Phosphorous": req.phosphorous,
            "Soil Type": req.soil_type,
            "Crop Type": req.crop_type
        }
        
        prediction_result = predict_fertilizer(inputs_dict)
        recommended_name = prediction_result['recommended_fertilizer']
        confidence = prediction_result['confidence']
        probabilities = prediction_result['probabilities']
        
        # Get explanation details
        explanation_data = FERTILIZER_DATABASE.get(
            recommended_name, 
            {
                "why_this": "Recommended based on soil nutrient profile.",
                "application_method": "Follow standard application guidelines.",
                "advantages": ["Improves crop yield."],
                "disadvantages": ["Over-application can damage soil."],
                "npk_ratio": "N-P-K Balanced",
                "organic_alternatives": ["Organic compost."],
                "safety_tips": ["Wear protective gear during handling."]
            }
        )
        
        explanation = FertilizerExplanation(
            why_this=explanation_data["why_this"],
            application_method=explanation_data["application_method"],
            advantages=explanation_data["advantages"],
            disadvantages=explanation_data["disadvantages"],
            npk_ratio=explanation_data["npk_ratio"],
            organic_alternatives=explanation_data["organic_alternatives"],
            safety_tips=explanation_data["safety_tips"]
        )
        
        # Document to save
        prediction_id = ObjectId()
        timestamp = datetime.utcnow()
        
        prediction_doc = {
            "_id": prediction_id,
            "user_id": current_user["_id"],
            "inputs": inputs_dict,
            "recommended_fertilizer": recommended_name,
            "confidence": confidence,
            "probabilities": probabilities,
            "explanation": explanation.model_dump(),
            "timestamp": timestamp
        }
        
        # Insert prediction record
        await predictions_collection.insert_one(prediction_doc)
        
        # Increment prediction count in user profile
        await users_collection.update_one(
            {"_id": ObjectId(current_user["_id"])},
            {"$inc": {"prediction_count": 1}}
        )
        
        return PredictionResponse(
            id=str(prediction_id),
            recommended_fertilizer=recommended_name,
            confidence=confidence,
            probability=probabilities,
            inputs=inputs_dict,
            explanation=explanation,
            timestamp=timestamp
        )
        
    except FileNotFoundError as fnf:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Machine learning model assets are not initialized. Please ask the administrator to train the model."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during prediction: {str(e)}"
        )
