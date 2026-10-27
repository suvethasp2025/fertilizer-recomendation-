from fastapi import APIRouter, Depends
from datetime import datetime, timedelta
from bson import ObjectId

from backend.app.database import predictions_collection, users_collection, model_metrics_collection
from backend.app.auth import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("")
async def get_analytics(current_user: dict = Depends(get_current_user)):
    """Retrieve structured analytics data for data visualizations on the dashboard."""
    user_id = current_user["_id"]
    is_admin = current_user.get("role") == "admin"
    query_filter = {} if is_admin else {"user_id": user_id}
    
    # 1. Active Users Count (Admins get total users, Farmers get 1)
    active_users = 1
    if is_admin:
        active_users = await users_collection.count_documents({})
        
    # 2. Prediction Trends (last 30 days, grouped by date)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    trend_filter = {**query_filter, "timestamp": {"$gte": thirty_days_ago}}
    pipeline_trend = [
        {"$match": trend_filter},
        {
            "$group": {
                "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$timestamp"}},
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"_id": 1}}
    ]
    res_trend = await predictions_collection.aggregate(pipeline_trend).to_list(100)
    
    # Format trend: fill in dates if empty
    trend_data = []
    # Make a dictionary of results for quick lookup
    trend_dict = {item["_id"]: item["count"] for item in res_trend}
    
    for i in range(30):
        d = (datetime.utcnow() - timedelta(days=29 - i)).strftime("%Y-%m-%d")
        trend_data.append({
            "date": d,
            "predictions": trend_dict.get(d, 0)
        })
        
    # 3. Crop Distribution (Pie Chart)
    pipeline_crop = [
        {"$match": query_filter},
        {"$group": {"_id": "$inputs.Crop Type", "value": {"$sum": 1}}},
        {"$sort": {"value": -1}}
    ]
    res_crop = await predictions_collection.aggregate(pipeline_crop).to_list(50)
    crop_distribution = [{"name": item["_id"], "value": item["value"]} for item in res_crop if item["_id"] is not None]
    
    # 4. Soil Distribution (Bar Chart)
    pipeline_soil = [
        {"$match": query_filter},
        {"$group": {"_id": "$inputs.Soil Type", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    res_soil = await predictions_collection.aggregate(pipeline_soil).to_list(50)
    soil_distribution = [{"soil": item["_id"], "count": item["count"]} for item in res_soil if item["_id"] is not None]
    
    # 5. Fertilizer Distribution
    pipeline_fert = [
        {"$match": query_filter},
        {"$group": {"_id": "$recommended_fertilizer", "value": {"$sum": 1}}},
        {"$sort": {"value": -1}}
    ]
    res_fert = await predictions_collection.aggregate(pipeline_fert).to_list(50)
    fert_distribution = [{"name": item["_id"], "value": item["value"]} for item in res_fert if item["_id"] is not None]
    
    # 6. Average N, P, K Values
    avg_n, avg_p, avg_k = 0.0, 0.0, 0.0
    pipeline_npk = [
        {"$match": query_filter},
        {
            "$group": {
                "_id": None,
                "avg_n": {"$avg": "$inputs.Nitrogen"},
                "avg_p": {"$avg": "$inputs.Phosphorous"},
                "avg_k": {"$avg": "$inputs.Potassium"}
            }
        }
    ]
    res_npk = await predictions_collection.aggregate(pipeline_npk).to_list(1)
    if res_npk and res_npk[0]["_id"] is not None:
        avg_n = round(res_npk[0]["avg_n"] or 0, 1)
        avg_p = round(res_npk[0]["avg_p"] or 0, 1)
        avg_k = round(res_npk[0]["avg_k"] or 0, 1)
        
    npk_distribution = [
        {"nutrient": "Nitrogen (N)", "average": avg_n},
        {"nutrient": "Phosphorus (P)", "average": avg_p},
        {"nutrient": "Potassium (K)", "average": avg_k}
    ]
    
    # 7. Model Performance Metrics
    model_perf = {
        "accuracy": 0.98,
        "precision": 0.97,
        "recall": 0.98,
        "f1": 0.97,
        "cv_accuracy": 0.95,
        "model_name": "Random Forest",
        "trained_at": None
    }
    metric_record = await model_metrics_collection.find_one({}, sort=[("trained_at", -1)])
    if metric_record:
        model_perf = {
            "accuracy": metric_record.get("accuracy", model_perf["accuracy"]),
            "precision": metric_record.get("precision", model_perf["precision"]),
            "recall": metric_record.get("recall", model_perf["recall"]),
            "f1": metric_record.get("f1", model_perf["f1"]),
            "cv_accuracy": metric_record.get("cv_accuracy", model_perf["cv_accuracy"]),
            "model_name": metric_record.get("model_name", model_perf["model_name"]),
            "trained_at": metric_record.get("trained_at")
        }
        
    return {
        "prediction_trend": trend_data,
        "crop_distribution": crop_distribution,
        "soil_distribution": soil_distribution,
        "fertilizer_distribution": fert_distribution,
        "npk_distribution": npk_distribution,
        "active_users": active_users,
        "model_performance": model_perf
    }
