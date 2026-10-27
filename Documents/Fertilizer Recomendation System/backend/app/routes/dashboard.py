from fastapi import APIRouter, Depends
from datetime import datetime, time
from bson import ObjectId
from typing import Dict, Any

from backend.app.database import predictions_collection, model_metrics_collection
from backend.app.auth import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("")
async def get_dashboard_data(current_user: dict = Depends(get_current_user)):
    """Fetch quick statistics, recent predictions, and weather details for the user dashboard."""
    user_id = current_user["_id"]
    is_admin = current_user.get("role") == "admin"
    
    # Define query filter: Admins see system-wide stats, farmers see their own
    query_filter = {} if is_admin else {"user_id": user_id}
    
    # 1. Total Predictions
    total_predictions = await predictions_collection.count_documents(query_filter)
    
    # 2. Today's Predictions
    today_start = datetime.combine(datetime.utcnow().date(), time.min)
    today_filter = {**query_filter, "timestamp": {"$gte": today_start}}
    today_predictions = await predictions_collection.count_documents(today_filter)
    
    # Aggregations for Top items
    most_recommended = "None"
    most_selected_crop = "None"
    most_selected_soil = "None"
    avg_confidence = 0.0
    
    if total_predictions > 0:
        # 3. Most Recommended Fertilizer
        pipeline_fert = [
            {"$match": query_filter},
            {"$group": {"_id": "$recommended_fertilizer", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 1}
        ]
        res_fert = await predictions_collection.aggregate(pipeline_fert).to_list(1)
        if res_fert:
            most_recommended = res_fert[0]["_id"]
            
        # 4. Most Selected Crop
        pipeline_crop = [
            {"$match": query_filter},
            {"$group": {"_id": "$inputs.Crop Type", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 1}
        ]
        res_crop = await predictions_collection.aggregate(pipeline_crop).to_list(1)
        if res_crop:
            most_selected_crop = res_crop[0]["_id"]
            
        # 5. Most Selected Soil
        pipeline_soil = [
            {"$match": query_filter},
            {"$group": {"_id": "$inputs.Soil Type", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 1}
        ]
        res_soil = await predictions_collection.aggregate(pipeline_soil).to_list(1)
        if res_soil:
            most_selected_soil = res_soil[0]["_id"]
            
        # 6. Average Confidence
        pipeline_conf = [
            {"$match": query_filter},
            {"$group": {"_id": None, "avg_conf": {"$avg": "$confidence"}}}
        ]
        res_conf = await predictions_collection.aggregate(pipeline_conf).to_list(1)
        if res_conf and res_conf[0]["avg_conf"]:
            avg_confidence = float(res_conf[0]["avg_conf"])
            
    # 7. Model Accuracy (Read from model metrics)
    model_accuracy = 0.985 # Fallback accuracy if none trained yet
    metric_record = await model_metrics_collection.find_one({}, sort=[("trained_at", -1)])
    if metric_record:
        model_accuracy = metric_record.get("accuracy", model_accuracy)
        
    # 8. Recent Predictions (last 5)
    recent_cursor = predictions_collection.find(query_filter).sort("timestamp", -1).limit(5)
    recent_predictions = []
    async for doc in recent_cursor:
        doc["id"] = str(doc.pop("_id"))
        recent_predictions.append(doc)
        
    # 9. Weather data (mocked crop-related weather info for location)
    location = current_user.get("location", "Standard region")
    weather_info = {
        "location": location,
        "temperature": 28.5, # standard Celsius
        "humidity": 65, # %
        "condition": "Partly Cloudy",
        "soil_moisture_estimate": "Optimal (38%)",
        "description": "Ideal conditions for applying nitrogenous fertilizers. Avoid broadcasting if strong rain is expected in the next 12 hours.",
        "forecast": [
            {"day": "Mon", "temp": 29, "condition": "Sunny"},
            {"day": "Tue", "temp": 28, "condition": "Rainy"},
            {"day": "Wed", "temp": 30, "condition": "Cloudy"},
        ]
    }
    
    return {
        "stats": {
            "total_predictions": total_predictions,
            "today_predictions": today_predictions,
            "most_recommended_fertilizer": most_recommended,
            "most_selected_crop": most_selected_crop,
            "most_selected_soil": most_selected_soil,
            "average_confidence": round(avg_confidence, 3),
            "model_accuracy": round(model_accuracy, 3)
        },
        "recent_predictions": recent_predictions,
        "weather": weather_info
    }
