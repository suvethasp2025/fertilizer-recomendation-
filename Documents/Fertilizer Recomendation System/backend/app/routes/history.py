from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional
from bson import ObjectId

from backend.app.database import predictions_collection, users_collection
from backend.app.auth import get_current_user

router = APIRouter(prefix="/api/history", tags=["Prediction History"])

@router.get("", response_model=dict)
async def get_history(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    search: Optional[str] = Query(None), # Search by recommended fertilizer
    crop_type: Optional[str] = Query(None),
    soil_type: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Retrieve paginated prediction history for the current user."""
    query = {"user_id": current_user["_id"]}
    
    # Optional search on recommended fertilizer name
    if search:
        query["recommended_fertilizer"] = {"$regex": search, "$options": "i"}
        
    # Optional filters
    if crop_type:
        query["inputs.Crop Type"] = crop_type
    if soil_type:
        query["inputs.Soil Type"] = soil_type
        
    skip = (page - 1) * limit
    
    # Query with sorting: newest first
    cursor = predictions_collection.find(query).sort("timestamp", -1).skip(skip).limit(limit)
    total_count = await predictions_collection.count_documents(query)
    
    history_list = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        history_list.append(doc)
        
    return {
        "history": history_list,
        "total": total_count,
        "page": page,
        "limit": limit,
        "pages": (total_count + limit - 1) // limit
    }

@router.delete("/{prediction_id}")
async def delete_history_item(prediction_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a prediction record from the user's history."""
    try:
        # Confirm prediction exists and belongs to current user
        pred_item = await predictions_collection.find_one({
            "_id": ObjectId(prediction_id),
            "user_id": current_user["_id"]
        })
        
        if not pred_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Prediction record not found or access denied."
            )
            
        # Delete record
        await predictions_collection.delete_one({"_id": ObjectId(prediction_id)})
        
        # Decrement prediction count in user profile
        await users_collection.update_one(
            {"_id": ObjectId(current_user["_id"])},
            {"$inc": {"prediction_count": -1}}
        )
        
        return {"status": "success", "message": "Prediction record deleted from history."}
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid prediction ID format."
        )
